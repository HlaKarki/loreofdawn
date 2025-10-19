# Gatotkaca

# Profile

He is based on the character with the same name in *Garudayana* comics by Is Yuniarto, making him the first and currently the only hero in *MLBB* that is based on an intellectual property.

- **Chinese name:** 金迦 (jīnjiā)
- **Alias:** Mighty Legend
- **Born:** Arcadhem Universe
- **Origin:** Nebula Chronorift
- **Species:** Human
- **Gender:** Male
- **Title:** Knight of Pringgadani
- **Affiliation:** *Asuras (hostile)*
- **Weapons:** *Antakusuma armor*, *Braiamusti-Braiadenta gauntlets*
- **Abilities:** *Electrokinesis*, *Flight*

# Story

> "Warrior from the Arcadhem universe"

The son of Bima and Arimbi from the Arcadhem Universe. When he was a child, he became a champion of the gods, fighting against enemies in his hometown.

# Bio

Gatotkaca the "Mighty Legend" was the son of Bima and Arimbi from the Arcapada universe. Since his childhood, he's been a champion of Gods and fought against the wicked enemies of his homeland.

Gatotkaca once lost in battle and was beaten near death, but he rose again as a mighty warrior of the Pandava clan, and obtained supernatural power after training within Candradimuka, the cauldron of heaven. With his Antakusuma armor and Braiamusti-Braiadenta gauntlets, he can fly across the skies like lightning and hunt down his sworn enemies, the wrathful Asuras.

Gatotkaca, the Knight of Pringgadani, is a symbol of bravery and devotion. Based on 'Garudayana' comic series created by Is Yuniarto and inspired from Indonesian traditional shadow puppets.

# Abilities

## Steel Bones

Description:

- Gatotkaca gains Physical Defense equal to 2% of his lost HP (up to 100). For every 300 damage he takes (calculated before damage reduction), he gains 5 Rage (up to 100). Upon reaching over 25 Rage, Gatotkaca's next Basic Attack becomes enhanced, consuming all Rage to deal extra Magic Damage and recover. The extra damage scales with his Rage, level, and Magic Power.

Formula (raw):

```
{\mathrm enhanced\ basic\ ATK\ DMG} = 100%\ total\ physical\ ATK + 200%\ total\ magic\ power + \{total\ rage \times \bigl[10 + (0.2 \times hero\ lv.) \bigr]\}\nhealing\ effect = 8 \times rage
where 25 \geq total\ rage \geq 100
```

Properties:

- Enhanced Basic Attack Range: 2.5

Calc:

- Source: User blog:Chrodotme/Gatotkaca enhanced basic attack formula

Notes:

- For each Gatotkaca's 1 lost HP increases his extra physical defense by 0.02 (for a maximum of 100 Physical Defense if he has at least 5000 lost HP.)
- Rage begins to deplete after approximately 3 seconds of Gatotkaca leaving in combat (i.e. not taking or dealing damage), with 10 Rage depleted every 0.5 seconds.
- Rage is used in multiples of 5, and will otherwise be rounded to the nearest multiple of 5. Example: having 38 Rage will output a damage as if having 40 Rage, while having 7 Rage will output a damage as if having 5 Rage.
- While these formulas are highly approximate, Rage generation can be inconsistent, resulting in same Rage but varied enhanced basic attack damage dealt.
- The heal is static and follows the rounding rule of Rage before it's calculated.
- Gatotkaca will perform a short dash to the target when dealing enhanced basic attack. (Patch Notes 1.7.82)

## Blast Iron Fist

Cooldown: 8.0 / 7.6 / 7.2 / 6.8 / 6.4 / 6.0 seconds

Mana Cost: 150

Description:

- Gatotkaca slams the ground, creating a shattered zone in the target direction while dealing damage to enemies within. Enemies in the shattered zone will take sustained magic damage per second (value scales with skill level and magic power) and be slowed by 30%.

Properties:

- Duration: approx. 3.5 seconds
- Spell Vamp Ratio: 50%
- Base Damage: 200 / 220 / 240 / 260 / 280 / 300 (by skill level)
- Sustained Damage: 100 / 110 / 120 / 130 / 140 / 150 (per tick)

Notes:

- "Sustained Damage" deals every 0.5 seconds and can deal up to 7 times.

## Unbreakable

Cooldown: 12.0 / 11.6 / 11.2 / 10.8 / 10.4 / 10.0 seconds

Mana Cost: 100

> "Impregnable!"

Description:

- Gatotkaca begins channeling, then sprints in the target direction with a battle cry, forcing enemies on the path to attack him and deal magic damage for 1.5 seconds. The sprint distance scales with the channel time. Canceling the Skill reduces 50% of the remaining Cooldown.

Terms:

- Taunt
- Magic Damage Skill
- Max HP

Properties:

- Spell Vamp Ratio: 50%
- Base Damage: 200 / 220 / 240 / 260 / 280 / 300

Notes:

- Gatotkaca can fully charge the skill for approximately 1⅙ seconds, and can overcharge for approx. another 3.75 seconds.

## Avatar of the Guardian

Cooldown: 54.0 / 50.0 / 46.0 seconds

Mana Cost: 300

> "A leap holds the world in awe."

Description:

- Gatotkaca jumps to the target location, dealing magic damage to nearby enemies and knocking them airborne for 1 second. Enemies near the center of the area will be knocked airborne for a longer duration, while enemies on the fringes will be pulled to the center. The camera will move with the skill indicator but won't grant extra sight.

Properties:

- Spell Vamp Ratio: 50%
- Base Damage: 500 / 750 / 1000

Notes:

- This skill has control immunity and his descending animation makes Gatotkaca untargetable.

# Trivia

- Gatotkaca is based on *Bharatayuddha*, a Javanese adaptation of the Sanskrit epic *Mahabharata*. According to the *Garudayana* 's creator, Is Yuniarto, his design is inspired by wayang, a traditional Javanese shadow puppet theater. Wayang is used in retelling epic, including *Bharatayuddha*.
- His most recent skin, "Tide Preserver," was released on January 8, 2024, making him the hero who received the skin for the longest period of time, 1745 days, between it and "Spark," which was released on March 30, 2019.
- His voicelines "Om Telolet Om" is a social media meme that depicts Indonesian youths' excitement when a bus driver honks a modified horn in a rhythmic manner as they pass by.
