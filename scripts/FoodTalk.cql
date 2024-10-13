with
    'REPLACE_WITH_YOUR_OPENAI_API_KEY' as OPENAI_API_KEY, // Create under https://platform.openai.com/organization/api-keys
    'REPLACE_WITH_YOUR_OPENAI_ORG_ID' as OPENAI_ORG_ID // Find under https://platform.openai.com/settings/organization/general
with `
    **Title: The Feast at Mulberry Inn**

    It was a chilly autumn evening when a group of friends found themselves gathered around the long wooden table at the Mulberry Inn. The old stone tavern was warm with the smell of roasting meats and fresh bread, its hearth crackling in the corner as the group settled into their chairs, awaiting the evening's grand feast. 

    Samantha, the innkeeper, strode over with a grin. "Welcome, everyone! Tonight’s special is a slow-roasted lamb with rosemary, garlic, and just a hint of lemon. We've also got a butternut squash soup and freshly baked sourdough. What can I start you off with?"

    "That lamb sounds perfect," replied Michael, rubbing his hands together. "I’m starving. Rosemary and garlic? You’re speaking my language."

    "Ah, but is there anything better than roasted lamb with lemon?" interjected Sarah, who was seated beside him. "Lemon just brightens everything up, doesn’t it? I love the way the acidity cuts through the richness."

    "I don't know if I can agree with you there," said Andrew, leaning back in his chair. "I’m more of a fan of heavier, heartier flavors. Give me something like a thick, creamy potato gratin with lots of cheese. Now *that's* comfort food."

    "Cheese on everything," joked Rachel from across the table. "Honestly, Andrew, if you could, you’d eat cheese with a spoon. Speaking of which, I’m excited for the butternut squash soup. Especially with a side of warm, crusty sourdough. There’s something about autumn that just makes me crave squash."

    "Not for me," said Jamie, shaking her head. "I had butternut squash overload last year. Everywhere I went, it was butternut this, butternut that. What I really want tonight is something light but flavorful—maybe a spinach and pear salad with goat cheese. You know? Something fresh but still autumnal."

    "Oh, goat cheese is a dream," sighed Michael. "I’d put it on everything if I could. But nothing compares to blue cheese. That tang, that punch—it’s not for everyone, but I love it."

    "Blue cheese?" Sarah wrinkled her nose. "It's like eating moldy socks."

    "Hey!" Michael protested, laughing. "You just don’t appreciate the finer things in life."

    "Speaking of finer things," said Rachel, "I was just thinking about dessert. Have you ever had a pear tart with a cinnamon crust? It’s sweet but not too heavy. You know me, I like to end on a light note."

    "Light note?" Andrew scoffed. "Dessert is the time to go all out! Molten chocolate cake, rich and gooey in the middle, with a scoop of vanilla ice cream melting on top? That's how you end a meal."

    "Molten chocolate cake?" Samantha, the innkeeper, who had just returned with a tray of appetizers, chimed in. "You’ll be happy to know we have one on the dessert menu tonight."

    Andrew’s face lit up. "I knew this was the right place to come."

    "I’m more interested in the baked apples with honey and walnuts," said Jamie. "That’s autumn in a bowl right there. I grew up eating those when the leaves started to turn. My mom always said it was the best way to end the day."

    "Sounds amazing," Michael added. "I think I’ll have both. Why limit yourself?"

    Laughter spread through the table as the conversation grew louder, punctuated by the clinking of wine glasses and the arrival of more dishes. Bowls of soup were passed around, followed by plates of lamb and roasted vegetables. Each friend sampled a bit of everything, their voices overlapping as they debated and discussed every bite.

    "This soup is so smooth," Rachel said, dipping a piece of sourdough into the creamy squash. "It’s like velvet."

    "And the lamb," Sarah murmured, closing her eyes. "It’s so tender it practically melts in your mouth. I’m so glad I went with the lemon after all. It’s perfect."

    Andrew, meanwhile, was thoroughly engrossed in his potato gratin, savoring the layers of creamy, cheesy goodness. "Samantha, you’ve outdone yourself," he said through a mouthful. "I don’t think I’ll ever be able to eat gratin anywhere else again."

    "Glad to hear it," Samantha replied with a wink. "I aim to please."

    As the night wore on, the group continued to feast, their plates emptying and their bellies filling. Talk of food turned into talk of memories, of childhood meals and family recipes, of holidays spent around tables like this one. The laughter and warmth of friendship made the food taste even better, and by the time dessert arrived, they were all happily stuffed but ready for more.

    The molten chocolate cake arrived, its rich center oozing as Andrew cut into it, while Rachel delicately broke off a piece of her pear tart, the scent of cinnamon wafting through the air.

    "Here’s to good food, and even better company," Michael said, raising his glass for a final toast.

    "To food," everyone echoed, lifting their glasses in unison.

    And so the night passed, filled with the joy of shared flavors and the comfort of friends. At the Mulberry Inn, it wasn’t just the food that warmed their hearts—it was the sense of togetherness that came with every bite.

    **The End**.
` as food_talk
with f`
    Extract who talked to who about which food from the text below.
    {food_talk}
    Return the results as json in the format below. If a person talked to everyone, then duplicate the entry for each person they talked to.
    [
        {{
            "speaker": "Andrew",
            "listener": "Rachel",
            "food": "potato gratin"
        }},
        ...
        {{
            "speaker": "Michael",
            "listener": "Sarah",
            "food": "blue cheese"
        }}
    ]
` as query
load json from
    'https://api.openai.com/v1/chat/completions'
    headers {
        Authorization: f'Bearer {OPENAI_API_KEY}',
        `OpenAI-Organization`:  f'{OPENAI_ORG_ID}'
    }
    post {
        model: 'gpt-4o-mini',
        messages: [{role: 'user', content: query}],
        temperature: 0.0
    }
as data
unwind tojson(replace(replace(data.choices[0].message.content, 'json', ''), '```', '')) as talk
merge (speaker:Person {name: talk.speaker})
merge (listener:Person {name: talk.listener})
merge (food:Food {name: talk.food})
merge (speaker)-[:TALKED_ABOUT]->(food)
merge (listener)-[:LEARNED_ABOUT]->(food)
with 1 as _
match p=()-[]->()
return p