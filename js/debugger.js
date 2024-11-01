var Cypher = require("./Cypher.js");

var engine = new Cypher();

var statement = `
    load json from
        "http://localhost:8000/grounding_data/get_pipeline_data?use_cache=true&clear_cache=false&use_synthetic_data=false&process_html_in_chats=true" as d
    load json from
        "http://localhost:8000/grounding_data/get_coach_goals" as g
    with d.observer.personalia.upn as observer, d.processed_chat_threads as threads, g.goals as goals
    unwind threads as thread
    with observer, sum(m in thread.messages where m.sender_personalia.upn = observer) as focal_user_messages
    with observer, focal_user_messages, size(thread.messages) - focal_user_messages as other_messages
    where focal_user_messages > 1 and other_messages > 1 // at least 2 messages from the observer and 2 messages from the other person
    unwind thread.messages as message
    with thread.source.display_uri as display_uri, collect({text: message.message, sender: message.sender_personalia.upn}) as messages
    unwind goals as goal
    // Check if conversation is coachable
    with f\`
        Is the following conversation at all coachable according to the goals provided?
        This is the conversation: {stringify(messages, 3)}
        This is the goal: {goal.description}
        These are examples of things to do for the goal: {join(goal.examples, ', ')}
        Only decide if the conversation is coachable based on messages from {observer}.

        Respond only in JSON in the following format:
        {{
            "coachable": true | false
            "justification": "reasoning behind the coachability decision"
        }}
    \` as coachable_prompt
    load text from 'http://localhost:8000/llm/query' post {
        messages: [
            {role: "user", content: coachable_prompt}
        ],
        max_tokens: 1000,
        model: "gpt-4-0125"
    } as coachable_text
    with tojson(replace(replace(coachable_text, '\`\`\`json', ''), '\`\`\`', '')) as coachable where coachable.coachable
    // Summarize the remaining coachable conversations
    with f\`
        Summarize the following conversation and extract the conversation objectives and key points:

        This is the conversation: {stringify(messages, 3)}

        Respond only in JSON in the following format:
        {{
            "conversation_summary": "A summary of the conversation",
            "conversation_objectives": ["Objective 1", "Objective 2"],
            "key_points": ["Key point 1", "Key point 2"]
        }}
    \` as summarize_conversations
    load text from 'http://localhost:8000/llm/query' post {
        messages: [
            {role: "user", content: summarize_conversations}
        ],
        max_tokens: 3000,
        model: "gpt-4-0125"
    } as conversation_summary
    load text from 'http://localhost:8000/llm/query' post {
        messages: [
            {role: "user", content: summarize_conversations}
        ],
        max_tokens: 3000,
        model: "gpt-4-0125"
    } as conversation_summary2
    with tojson(replace(replace(conversation_summary, '\`\`\`json', ''), '\`\`\`', '')) as summary
    return summary.conversation_summary as \`Conversation Summary\`,
        summary.conversation_objectives as \`Conversation Objectives\`,
        summary.key_points as \`Key Points\`,
        coachable.justification as \`Coachability Justification\`,
        display_uri as \`Display URI\`

`;

engine.execute(
    statement,
    function(results) {
        console.log(JSON.stringify(results.graph));
        console.log(JSON.stringify(results));
    },
    function(error) {
        console.log(error);
    }
);