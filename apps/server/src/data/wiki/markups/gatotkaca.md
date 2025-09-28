{{Tabs hero}}
{{Infobox hero}}
He is based on the character with the same name in ''Garudayana'' comics by Is Yuniarto, making him the first and currently the only hero in ''MLBB'' that is based on an intellectual property.
{{hero stats|physical_def1=10|physical_def15=99|magic_def1=15|magic_def15=71|hp1=2629|hp15=5569}}

== Story ==
{{Infobox hero story
| name            = 
| chinese_name    = 金迦 (jīnjiā) 
| image           = 
| full_name       = 
| alias           = Mighty Legend
| born            = Arcadhem Universe
| birthday        = {{birthday|4|18}}<ref name="CNProfile">Official Profile from MLBB CN</ref>
| origin          = [[Nebula Chronorift]]
| age             = 
| species         = Human
| gender          = Male
| title           = Knight of Pringgadani
| occupation      = 
| fields_of_study = 
| affiliation     = *Asuras (hostile)
| fighting_style  = 
| weapons         = *Antakusuma armor
*Braiamusti-Braiadenta gauntlets
| abilities       = *Electrokinesis
*[[#Ultimate|Flight]]
| religion        =
| nationality     = 
| battles_fought  = 
| height          = 
| weight          = 
| traits          = 
| likes           = 
| dislikes        = 
| relationships   = 
| en_va           = 
| ja_va           = 
| id_va           = 
| tl_va           = 
| ar_va           = 
| pt_va           = 
| ru_va           = 
| tk_va           = 
| es_va           = 
| zh_va           = 
}}
{{quote|Warrior from the Arcadhem universe}}
The son of Bima and Arimbi from the Arcadhem Universe. When he was a child, he became a champion of the gods, fighting against enemies in his hometown.

=== Lore ===
Gatotkaca the "Mighty Legend" was the son of Bima and Arimbi from the Arcapada universe. Since his childhood, he's been a champion of Gods and fought against the wicked enemies of his homeland.

Gatotkaca once lost in battle and was beaten near death, but he rose again as a mighty warrior of the Pandava clan, and obtained supernatural power after training within Candradimuka, the cauldron of heaven. With his Antakusuma armor and Braiamusti-Braiadenta gauntlets, he can fly across the skies like lightning and hunt down his sworn enemies, the wrathful Asuras.

Gatotkaca, the Knight of Pringgadani, is a symbol of bravery and devotion. Based on 'Garudayana' comic series created by Is Yuniarto and inspired from Indonesian traditional shadow puppets.
{{clr}}

== Abilities ==
=== Passive ===
{{Ability
|name            = Steel Bones
|skill-effect-1  = Buff
|skill-effect-2  = Heal
|description     = Gatotkaca gains [1] [[Physical Defense]] equal to 2% of his [[HP|lost HP]] (up to 100). For every 300 damage he takes (calculated before damage reduction), he gains 5 [[Rage]] (up to 100).<br>Upon reaching over 25 Rage, Gatotkaca's next [[Basic Attack]] becomes enhanced, consuming all Rage to deal extra Magic Damage and recover. The extra damage scales with his Rage, level, and [[Magic Power]].
|term-1          = Physical Defense
|term-2          = Lost HP
|term-3          = Healing Effect
|calc            = <math>\begin{align}
{\mathrm enhanced\ basic\ ATK\ DMG} & = 100%\ total\ physical\ ATK + 200%\ total\ magic\ power\ + \Bigl\{total\ rage \times \bigl[10 + (0.2 \times hero\ lv.) \bigr]\Bigr\} \\
healing\ effect & = 8 \times rage \\
{\mathrm where}\ 25 & \geq total\ rage \geq 100\\
\end{align}</math>
<div style="text-align:right">''Source: [[User blog:Chrodotme/Gatotkaca enhanced basic attack formula]]''</div>
|properties      = *'''Enhanced [[Basic Attack Range]]:''' 2.5
|notes           = *For each Gatotkaca's 1 lost HP increases his extra physical defense by 0.02 (for a maximum of 100 Physical Defense if he has at least 5000 lost HP.)
*Rage begins to deplete after approximately 3 seconds of Gatotkaca leaving in combat (i.e. not taking or dealing damage), with 10 Rage depleted every 0.5 seconds.
*Rage is used in multiples of 5, and will otherwise be rounded to the nearest multiple of 5. Example: having 38 Rage will output a damage as if having 40 Rage, while having 7 Rage will output a damage as if having 5 Rage.
**While these formulas are highly approximate, Rage generation can be inconsistent, resulting in <!--same Rage numbers (while still being multiples of 5) with the same damage taken, and-->same Rage but varied enhanced basic attack damage dealt.
*The heal is static and follows the rounding rule of Rage before it's calculated.
*Gatotkaca will perform a short dash to the target when dealing enhanced basic attack. ([[Patch Notes 1.7.82]])
|bugs            = 
}}

=== Skill 1 ===
{{Ability
|name            = Blast Iron Fist
|skill-effect-1  = AOE
|skill-effect-2  = Slow
|cooldown        = 8.0 / 7.6 / 7.2 / 6.8 / 6.4 / 6.0
|description     = Gatotkaca slams the ground, creating a shattered zone in the target direction while dealing {{scale|base=200-300|total-mp=150|md}} to enemies within. Enemies in the shattered zone will take {{scale|base=100-150|total-mp=20|md}} per second and be [[slowed]] by 30%.
|term-1          = Magic Damage Skill
|term-2          = Movement Speed
|term-3          = 
|calc            = 
|properties      = *'''Duration:''' approx. 3.5
*'''[[Spell Vamp Ratio]]:''' 50%
*'''Base Damage:''' 200 / 220 / 240 / 260 / 280 / 300
*'''Sustained Damage:''' 100 / 110 / 120 / 130 / 140 / 150
|notes           = *"Sustained Damage" deals every 0.5 seconds and can deal up to 7 times.
|bugs            = 
}}

=== Skill 2 ===
{{Ability
|name            = Unbreakable
|skill-effect-1  = CC
|skill-effect-2  = Blink
|cooldown        = 12.0 / 11.6 / 11.2 / 10.8 / 10.4 / 10.0
|quote           = Impregnable!
|description     = Gatotkaca begins channeling, then [[blink|sprints]] in the target direction with a battle cry, forcing enemies on the path to attack him and deal {{scale|base=200-300|total-mp=100|md}} for 1.5 seconds. The sprint distance scales with the channel time. Canceling the Skill reduces 50% of the remaining [[Cooldown]].
|term-1          = Taunt
|term-2          = Magic Damage Skill
|term-3          = Max HP
|calc            = 
|properties      = *'''[[Spell Vamp Ratio]]:''' 50%
*'''Base Damage:''' 200 / 220 / 240 / 260 / 280 / 300
|notes           = *Gatotkaca can fully charge the skill for approximately 1⅙ seconds, and can overcharge for approx. another 3.75 seconds.
|bugs            = 
}}

=== Ultimate ===
{{Ability
|name            = Avatar of the Guardian
|skill-effect-1  = CC
|skill-effect-2  = Blink
|cooldown        = 54.0 / 50.0 / 46.0
|quote           = A leap holds the world in awe.
|description     = Gatotkaca [[blink|jumps]] to the target location, dealing {{scale|base=500-1000|total-mp=300|md}} to nearby enemies and knocking them [[airborne]] for 1 second. Enemies near the center of the area will be knocked airborne for a longer duration, while enemies on the fringes will be [[pulled]] to the center.<br>The camera will move with the skill indicator but won't grant extra sight.
|term-1          = 
|term-2          = 
|term-3          = 
|calc            = 
|properties      = *'''[[Spell Vamp Ratio]]:''' 50%
*'''Base Damage:''' 500 / 750 / 1000
|notes           = *This skill has [[control immunity]] and his descending animation makes Gatotkaca [[untargetable]].
|bugs            = 
}}

== Gallery ==
=== Splash art ===
<gallery captionalign="center" spacing="small" hideaddbutton="true">
Gatotkaca (Iron Steel).jpg|Iron Steel
Gatotkaca (Mighty Guardian).jpg|Mighty Guardian
Gatotkaca (Arhat King).jpg|Arhat King
Gatotkaca (Sentinel).jpg|Sentinel
Gatotkaca (Spark).jpg|Spark
Gatotkaca (Tide Preserver).jpg|Tide Preserver
Gatotkaca (Nutcracker Monarch).jpg|Nutcracker Monarch
</gallery>
===Avatar icons===
<gallery bordercolor="transparent" captionalign="center" spacing="small" widths="100" hideaddbutton="true">
Hero411-icon.png|Iron Steel
Hero412-icon.png|Mighty Guardian
Hero413-icon.png|Arhat King
Hero414-icon.png|Sentinel
Hero416-icon.png|Spark
Hero417-icon.png|Tide Preserver
Hero418-icon.png|Nutcracker Monarch
</gallery>
;Painted avatar icons
<gallery bordercolor="transparent" captionalign="center" spacing="small" widths="100" hideaddbutton="true">
Hero418-color01-icon.png|Nutcracker Earl
Hero418-color02-icon.png|Nutcracker Duke
</gallery>
=== Battle Emotes===
<gallery bordercolor="transparent" captionalign="center" spacing="small" widths="100" hideaddbutton="true">
Happy Independence Day!.png|'''Happy Independence Day!'''<br>Obtained from the "Indonesian Independence Day" event
Try me.png|'''Try me'''<br>Obtained via the Emote Shop.
</gallery>

==Videos==
<gallery captionalign="center" spacing="small" hideaddbutton="true">
Mobile Legends- Bang bang! New Hero -Mighty Legend Gatotkaca- Gameplay|Gatotkaca Hero Spotlight (now private)
</gallery>

==Trivia==
*Gatotkaca is based on ''[[Wp:Bharatayuddha|Bharatayuddha]]'', a Javanese adaptation of the Sanskrit epic ''[[Wp:Mahabharata|Mahabharata]]''. According to the ''Garudayana''<nowiki>'</nowiki>s creator, Is Yuniarto, his design is inspired by ''[[Wp:wayang|wayang]]'', a traditional Javanese shadow puppet theater. ''Wayang'' is used in retelling epic, including ''Bharatayuddha''.
*His most recent skin, "Tide Preserver," was  released on January 8, 2024, making him the hero who received the skin for the longest period of time, 1745 days, between it and "Spark," which was released on March 30, 2019.
*His voicelines "Om Telolet Om" is a social media meme that depicts Indonesian youths' excitement when a bus driver honks a modified horn in a rhythmic manner as they pass by. 

== References ==
{{reflist}}
{{Heroes}}