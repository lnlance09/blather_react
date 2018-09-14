# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: localhost (MySQL 5.5.42)
# Database: blather
# Generation Time: 2016-10-17 15:54:54 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table fallacies
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fallacies`;

CREATE TABLE `fallacies` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `synonyms` text,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `fallacies` WRITE;
/*!40000 ALTER TABLE `fallacies` DISABLE KEYS */;

INSERT INTO `fallacies` (`id`, `name`, `synonyms`, `description`)
VALUES
	(113,'Ad Hominem Abusive','','This is an insult that is given instead of a reason.'),
	(114,'Ad Hominem Association','','This is an attempt to discredit the arguer by linking him or her to something or someone that is thought of in a negative way.'),
	(115,'Ad Hominem Circumstantial','','This is an attack on the circumstances of the arguer. May imply ulterior motives or conflict of interests.'),
	(116,'Ad Hominem Tu Quoque','','This is an attack on the circumstances of the arguer. May imply ulterior motives or conflict of interests.'),
	(117,'Ad Populum Bandwagoning','Appeal to popularity, Appeal to the majority','Where a proposition is claimed to be true or good solely because many people believe it to be so.'),
	(118,'Ad Populum Snobbery','','An argument that states that something must be valuable because it is used only by an exclusive group.'),
	(119,'Anecdotal Fallacy','','Using a personal experience or an isolated example instead of sound reasoning or compelling evidence.'),
	(120,'Appeal to Authority','','The arguer tries inflate the worth of his argument by associating it with a well known authority who is not an authority on the subject at hand. The arguer may also try to use his/her own authority to persuade listeners.'),
	(121,'Appeal to Force','','This is really just a threat. The arguer tries to get others to adopt his/her point of view or else the arguer will cause them harm.'),
	(122,'Appeal to Nature','','Wherein judgment is based solely on whether the subject of judgment is \"natural\" or \"unnatural.\"'),
	(123,'Appeal to Tradition','Appeal to Antiquity','This form of argument tries to pursued the listener that an idea must be true because it has been believed or practiced for a long time. Of course, an ideas logical worth should have nothing to do with how long people have held it.'),
	(124,'Appeal to Victimization','','The arguer claims priviliged knowledge of a questionable entity by claiming to be a victim of it (and thereby shielding himself from criticism).'),
	(125,'Argumentum Verbosium','Shotgun augmentation, Proof by Intimidation','The arguer produces an overwhelming array of statements and/or technical jargon in a relatively short period of time.  The opponent is unable to address them all or even understand them.  Observers will likely be impressed, but have no way of checking the validity of the claims.'),
	(126,'Association Fallacy','Guilt by association','Arguing that because two things share a property they are the same.'),
	(127,'Begging the Question','Circular reasoning, petitio principii, circulus in demonstrando','Providing what is essentially the conclusion of the argument as a premise.'),
	(128,'Black-or-white','False Dilemma, False Dichotomy','The arguer gives the impression that there are only two extreme positions that are possible. This does not allow for moderate, middle grounds or grey areas.'),
	(129,'Black Swan Fallacy','','The arguer concludes that a concept does not exist because it has not been observed. This comes from the observation that since most swans are white, one may never see a black swan and therefore conclude that all swans are white. However, there are black swans in the world that the observer is unaware of.'),
	(130,'Broken Window Fallacy','','The belief that destruction is economically befeficial because it will provide jobs to people who will rebuild what was destroyed. This fails to take into consideration all of the ways that the money could have been spent if it were not needed to rebuld what was destroyed.'),
	(131,'Burden of Proof','Onus Probandi','Instead of providing evidence to support a claim, the arguer implies that it is true because his/her opponent has not proved it to be false. \n								\n								Alternatively, one could argue that because the opponent hasn\'t proven a statement to be false, then it must be true.\n\n								Actually, it is accepted that the burden of proof for an unusual claim lies with the person who is making the claim. \'Extraordinary claims require extraordinary evidence\' (Carl Sagan).'),
	(132,'Cherry Picking','','The act of pointing at individual cases or data that seem to confirm a particular position, while ignoring a significant portion of related cases or data that may contradict that position.'),
	(133,'Composition Fallacy','','The composition fallacy is committed when one assumes that a quality of a thing can be determined by the quality of its individual parts.'),
	(134,'Continuum fallacy','','Improperly rejecting a claim for being imprecise.'),
	(135,'Cry Bullying','','This is a combination of two fallacies; appeal to victimization and appeal to force. Typically, the role of the person who is using this fallacy will constanty shift between victim and aggressor. One minute, they\'ll claim to be a helpless victim and the next, they\'ll outright threaten you. The result is general confusion as the viewers will most likely not know which role is genuine.'),
	(136,'Cum Hoc Ergo Propter Hoc','','When two things seem to happen in correlation with each other, many will mistakenly think that one thing caused the other when no such causal relationship has been established.'),
	(137,'Division Fallacy','','The division fallacy is committed when one assumes that a quality of a thing\'s individual parts can be determined by the quality of the whole.'),
	(138,'Equivocation','weasel words, ambiguity','The arguer covertly uses an alternate definition of a word that is key to the discussion.'),
	(139,'Fallacy Fallacy','','This is a tricky one that skeptics have to be wary of.  We may be tempted to claim that the conclusion of an argument is wrong because the arguer used a logical fallacy in his or her reasoning. <br><br>\n\n								Just because a fallacy was used does not mean that the conclusion is necessarily incorrect.'),
	(140,'Fallacy of Quoting out of Context','','Refers to the selective excerpting of words from their original context in a way that distorts the source\'s intended meaning.'),
	(141,'False Equivalence','False Analogy','Describes a situation of logical and apparent equivalence, when in fact there is none.'),
	(142,'Gambler\'s Fallacy','','The mistaken belief that a random event must be due to happen soon if it has not happened in an unusually long time.'),
	(143,'Genetic Fallacy','','When a conclusion is suggested based solely on something or someone\'s origin rather than its current meaning or context.'),
	(144,'Hasty Generalization','','The arguer attributes a property to an entire group based only on observing that property in an individual.'),
	(145,'Hate Speech Fallacy','Secular Blasphemy','The arguer attempts to discredit their opponent and/or their contention by incorrectly asserting that they\'re somehow either racist, sexist or bigoted. This may come in the form of an Ad Hominem.'),
	(146,'If-by-whiskey','','An argument that supports both sides of an issue by using terms that are selectively emotionally sensitive.'),
	(147,'Incredulity','','The arguer tries to get the listener to think that something cannot be true because it is unbelievable (to the arguer).'),
	(148,'Kettle Logic','','Using multiple, jointly inconsistent arguments to defend a position.'),
	(149,'Loaded Question','','A question posed that implies an unstated major premise such that any answer will trap the answerer into appearing to agree with the unstated premise.'),
	(150,'Middle Ground','Argument to Noderation, False Compromise','Assuming that the compromise between two positions is correct.'),
	(151,'Moral High Ground','Sanctimony','In which one assumes a \'holier-than-thou\' attitude in an attempt to make oneself look good to win an argument.<br><br>\n\n							Basically, disagree with me and you\'re morally bankrupt. This fallacy is very similar to the Hate Speech Fallacy in the sense that proponents of the latter also tend to scramble for the moral high ground.'),
	(152,'Moving the Goalposts','','When criteria are met that falsify the arguer\'s position, the arguer changes the criteria and claims that his/her position is still valid.'),
	(153,'Nirvana Fallacy','','When arguing against an action or policy, this fallacy is committed if the arguer declares the action to be useless if it does not lead to ideal conditions. It is related to the false dichotomy in that it implies that if the action does not lead to perfection, then it is useless. It does not recognize that simple improvement is worthwhile. <br><br>\n\n								Essentially, if it isn\'t perfect, then it is useless.'),
	(154,'No True Scotsman','','If the premise of the argument is falsified with a counter example, rather than changing the conclusion, the arguer changes the definition of a major premise to make both the premise and the conclusion true. <br><br>\n  \n								Typically, the arguer makes a sweeping generalization about a an entire group. This is usually done by implying that the group is bound and defined by the arbitrary quality. <br><br> \n\n								If an exception to this generalization is pointed out, the arguer dismisses the exception as not truly belonging to the group in the first place.'),
	(155,'Non Sequitur','','(Latin for \"it does not follow\") When the conclusion of an argument that does not follow from its premises.'),
	(156,'Post Hoc Fallacy','False Cause, coincidental correlation, correlation without causation','A precedes B, therefore A caused B.'),
	(157,'Proof by Lack of Evidence','','This fallacy is often used by conspiracy theorists. Powerful conspiratorial forces will cover their tracks well, so that no evidence of the conspiracy can be expected.'),
	(158,'Red Herring','','A speaker attempts to distract an audience by deviating from the topic at hand by introducing a separate argument the speaker believes is easier to speak to.'),
	(159,'Shill Gambit','','Conspiracy theory style reasoning wherein an argument is dismissed because the person who is putting it forth is assumed be profiting from the position that they\'re taking. This can also be an ad hominem attack. It\'s common for the person whose argument has been dismissed to be accused of being on a company\'s payroll. This assumes that the only legitimate reason one can have for taking a certain position is personal gain.'),
	(160,'Slippery Slope Fallacy','','The arguer tries to convince others that one action will lead to a series of events that will eventually lead to an ultimate, usually unwanted, consequence.  This is fallacious if it is unlikely that each intermediate step will necessarily follow the preceding one.'),
	(161,'Special Pleading','Special Snowflake Syndrome','The arguer attempts to explain a discrepancy in his/her argument by assigning special properties to his/her position that immunizes it from criticism. Special Pleading may render a claim unfalsifiable. <br><br>\n \n								The fallacy of Special Pleading occurs when someone argues that a case is an exception to a rule based upon an irrelevant characteristic that does not define an exception. <br><br>\n \n								Special Pleading also may occur when the arguer implies that opponents of his/her point of view cannot possibly understand it because they lack the capacity or skills needed to comprehend it.'),
	(162,'Strawman','','Giving the impression of refuting an opponent\'s argument, while actually refuting an argument that was not advanced by that opponent.'),
	(163,'Texas Sharpshooter Fallacy','','This is committed when one tries to attribute significance or meaning to random events after the events have already happened. This is usually done to support some pre-existing claim. <br><br>\n \n								This happens when studies are done that have no specific, predicted\n								results. A random clumping of data may be highlighted as being significant, especially if it seems to confirm the hypothesis. <br><br>\n\n								This leads to false conclusions about causation when data clusters by random chance around a given point. Since this is random, repeated trials show that the data is no more likely to fall near this point than any other random point.'),
	(164,'Thought-terminating Cliché','','A commonly used phrase, sometimes passing as folk wisdom, used to quell cognitive dissonance, conceal lack of thought-entertainment, move on to other topics etc. but in any case, end the debate with a cliché—not a point.'),
	(165,'Toupee Fallacy','','The arguer claims that they can always recognize when something is present.  This is likely a fallacy because the arguer is not aware of all of the times that he/she did not recognize it.'),
	(166,'Two Wrongs Make a Right','','When a person attempts to justify an action against another person because the other person did take or would take the same action against him or her.'),
	(167,'Word Salad','','This isn\'t any sort of coherent argument or rhetoric. However, it often masquerades as one if the person communicating it is well spoken. This is essentially just a  confused or unintelligible mixture of seemingly random words and phrases.'),
	(168,'Zero-Sum Fallacy','','When one assumes that one person’s gain is a loss to other players; and the total amount of the available money or resources fixed. A logical fallacy often occurs when this particular game theory is applied to economic or political discussions amongst non-economists – leading to false beliefs that the amount of wealth or jobs in the economy is fixed.');

/*!40000 ALTER TABLE `fallacies` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table fallacy_dialogues
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fallacy_dialogues`;

CREATE TABLE `fallacy_dialogues` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `thread_id` int(11) DEFAULT NULL,
  `commenter` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `comment` text,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `fallacy_dialogues` WRITE;
/*!40000 ALTER TABLE `fallacy_dialogues` DISABLE KEYS */;

INSERT INTO `fallacy_dialogues` (`id`, `thread_id`, `commenter`, `role`, `comment`, `order`)
VALUES
	(359,175,'Blathering Bill',NULL,'You are wrong because you\'re a moron!',0),
	(360,176,'Benjamin Allen Teter','Student','You\'ve never experienced oppression in your entire fucking life!',0),
	(361,176,'Unidentified Trump Supporter','','How do you know that?',1),
	(362,176,'Benjamin Allen Teter','Student','You\'re fuckin\' white male! You\'re a white man!',2),
	(363,177,'Blathering Bill',NULL,'We shouldn\'t take him seriously. His company used to do business with organized crime.',0),
	(364,178,'Blathering Bill',NULL,'Of course the Senator wants more laws. He is a politician. Making more laws is what keeps politicians in business!',0),
	(365,179,'Blathering Bill',NULL,'Rob said that smoking is detrimental to your health, but he smokes two packs a day.',0),
	(366,180,'Paul Joseph Watson','Commentator','.@LeoDiCaprio steps off his private jet after another 3,000 mile trip to lecture us about our carbon footprint.',0),
	(367,181,'Blathering Bill','','This stock must be a great investment!',0),
	(368,181,'Rational Rob','','How so?',1),
	(369,181,'Blathering Bill','','Look at all of the other people that are buying it!',2),
	(370,182,'Bill Maher','Television Host','You don\'t believe that Bin Laden knocked down the World Trace Center?',0),
	(371,182,'Mos Def','Rapper, Actor','Absolutely not!',1),
	(372,182,'Mos Def','Rapper, Actor','Go to any barber shop. I am so not alone. I am so not alone...',2),
	(373,182,'Bill Maher','Television Host','That doesn\'t mean you\'re right.',3),
	(374,182,'Mos Def','Rapper, Actor','That don\'t mean that it is not valid neither!',4),
	(375,182,'Mos Def','Rapper, Actor','Highly educated people in all areas of science have spoken on the, the, the fishiness of that whole 911 theory. It\'s like the magic bullet and all that shit! ',5),
	(376,182,'Bill Maher','Television Host','And what happened?',6),
	(377,182,'Mos Def','Rapper, Actor','I don\'t think these motherfuckers been to the moon, either. But, that\'s just me!',7),
	(378,183,'Rational Rob',NULL,'This beer is really good!',0),
	(379,183,'Blathering Bill',NULL,'You shouldn\'t buy Budweiser. Classy people drink imports.',1),
	(380,185,'Blathering Bill',NULL,'Jim Carrey thinks that vaccines are causing more harm than good. I won\'t let my child be vaccinated even though our pediatrician recommends it.',0),
	(381,186,'Sam Harris','Author, Neuroscientist','We have to admit to ourselves that we\'re confronting the behavior of a death cult. We can\'t deny this problem while encouraging a more benign face on the religion.',0),
	(382,186,'Reza Aslan','Religious scholar','There\'s a reason that I don\'t write books about neuroscience... because I don\'t have an expertise in neuroscience. I write books about what\'s going on in the Muslim world because I have an expertise in what\'s going on in the Muslim world.',1),
	(383,187,'Blathering Bill',NULL,'You\'d better start liking the Jonas Brothers or I will tell your parents that you skipped school last week!',0),
	(384,188,'Zoey Tur','Transgender activist','We both know chromosomes don\'t necessarily mean you\'re male or female. [crosstalk]. But, even so, you have a thing like Klinefelter syndrome. So, you don\'t know what you\'re talking about. You\'re not educated on genetics.',0),
	(385,188,'Ben Shapiro','Attorney','Would you like to discuss the genetics? What are your genetics, sir?',1),
	(386,188,'Zoey Tur','Transgender activist','You cut that out now or you\'ll go home in an ambulance.',2),
	(387,188,'Ben Shapiro','Attorney','Now, that seems mildly inappropriate for a political discussion.',3),
	(388,189,'Rational Rob',NULL,'Bill, you\'ve been ill and bed ridden for the past six days. Don\'t you think that maybe you should go to the hospital?',0),
	(389,189,'Blathering Bill',NULL,'And let them inject me with all of these man-made chemicals? Hell no! If it ain\'t natural, it don\'t belong in your body!',1),
	(390,190,'Blathering Bill',NULL,'Slavery isn\'t immoral! It has been practiced for thousands of years. Our culture was built on slavery!',0),
	(391,191,'Christopher Hitchens','Author','The idea is to import, surreptitiously, to smuggle through customs, the idea that this is a Christian nation. Which is part of your own agenda, is it not?',0),
	(392,191,'Tony Perkins','President of the Family Research Council','Christopher, this goes all the way back, as I mentioned to George Washington.',1),
	(393,192,'Blathering Bill',NULL,'Morgellan\'s disease is real. I have been suffering from it for years and that\'s all the science I need!',0),
	(394,193,'Piers Morgan','Television host','Why do you want to deport me?',0),
	(395,193,'Alex Jones','Radio host','Well, we did it as a way to bring attention to the fact that we have all of these foreigners and the Russian government, the official Chinese government. Mao said political power goes out the barrel of a gun. He killed about 80 million people because he\'s the only guy that had the guns. So we did it to point out that this is globalism, and the mega banks that control the planet and brag that they\'ve taken over in Bloomberg, AP, Reuters, you name it, brag that they\'re going to get our guns as well. <br><br>\n\n																		They\'ve taken everybody\'s guns but the Swiss and the American people. And when they get our guns, they can have their world tyranny while the government buys 1.6 billion bullets, armored vehicles, tanks, helicopters, predator drones, armed, now in U.S. skies, being used to arrest people in North Dakota. <br><br>\n\n																		The Second Amendment isn\'t there for duck hunting. It\'s there to protect us from tyrannical government and street thugs. Take the women in India, your piece earlier on CNN I was watching during Anderson Cooper\'s show didn\'t tell you that the women of India have signed giant petitions to get firearms because the police can\'t and won\'t protect them. The answer is -- <br><br>\n\n																		Wait a minute. I have FBI crime statistics that come out a year late, 2011, 20-plus percent crime drop in the last nine years, real violent crime because more guns means less crime. Britain took the guns 15, 16 years ago, tripling of your overall violent crime. True we have a higher gun violence level, but overall muggings, stabbings, deaths, you -- those men raped that woman in India to death with an iron rod four feet long. <br><br>\n\n																		You can\'t ban the iron rods. The guns, the iron rods, Piers, didn\'t do it. The tyrants did it. Hitler took the guns. Stalin took the guns. Mao took the guns. Fidel Castro took the guns. <br><br> \n\n																		Hugo Chavez took the guns, and I\'m here to tell you, 1776 will commence again if you try to take our firearms. It doesn\'t matter how many lemmings you get out there on the street begging for them to have their guns taken. We will not relinquish them. Do you understand? <br><br>\n\n																		And that\'s why you\'re going to fail. And the establishment knows no matter how much propaganda, the republic will rise again when you attempt to take our guns. My family in the Texas revolution against Santa Anna, my family was at the core on both sides starting that because Santa Anna came to take the guns at Gonzalez, Texas. <br><br>\n\n																		Piers, don\'t try what your ancestors did before. Why don\'t you come to America? I\'ll take you out shooting. You can become an American and join the republic.',1),
	(396,193,'Piers Morgan','Television host','You finished?',2),
	(397,196,'Blathering Bill',NULL,'People are either Democrats or Republicans!',0),
	(398,196,'Rational Rob',NULL,'Aren\'t there lots of third parties too?',1),
	(399,197,'Nate','Patriotic American','You, Mr. Kapernick, if you don\'t love our country, then get the fuck out of it. Okay?',0),
	(400,199,'Rational Rob','','Let me tell you, Bill, the job of an automotive mechanic doesn\'t pay like it used to. I might need to find a new career.',0),
	(401,199,'Blathering Bill','','I\'ve got a good idea. How about I take a sledgehammer to the hoods of some of the cars that are parked around the corner? The owners of those cars will definitely need to hire a mechanic after I get done with them! Lots of people will be spending money and it will boost the local economy too.',1),
	(402,200,'Paul Krugman','Economist','So the direct economic impact of the attacks will probably not be that bad. And there will, potentially, be two favorable effects.\n\nFirst, the driving force behind the economic slowdown has been a plunge in business investment. Now, all of a sudden, we need some new office buildings. As I\'ve already indicated, the destruction isn\'t big compared with the economy, but rebuilding will generate at least some increase in business spending.',0),
	(403,201,'Blathering Bill',NULL,'The government does have you believe that aliens have not been visiting us over the years. I tell you that the aliens are here. The government has not provided evidence to the contrary despite our allegations!',0),
	(404,202,'Ben Shapiro','Attorney','When there is no evidence of racism, it\'s probably not racism. When there\'s actual evidence of racism, it\'s probably racism.',0),
	(405,202,'Charles Mudede','Activist','But, there has to be racism. You can\'t say there\'s no racism.',1),
	(406,202,'Ben Shapiro','Attorney','Without evidence?',2),
	(407,203,'Blathering Bill',NULL,'Smoking doesn\'t cause lung cancer. My great grandmother smoked two packs a day for 50 years and when she died, she had no cancer whatsoever.',0),
	(408,204,'Blathering Bill',NULL,'The Cleveland Browns are a great football team. It has had many first round draft picks.',0),
	(409,205,'Levi\'s mom','Stay-at-home mom','One popular thing to do in American politics is to note that the summers in the United States over the past few years have been very warm. As a result, global warming must be real. What\'s wrong with this reasoning? ',0),
	(410,205,'Levi O\'Brien','Student','It [the temperature] has only gone up 0.6 degrees.',1),
	(411,205,'Levi\'s mom','Stay-at-home mom','Yeah, it\'s not really a big problem, is it?',2),
	(412,205,'Levi O\'Brien','Student','No',3),
	(413,206,'Rational Rob',NULL,'Bill, what the fuck, man? You screwed my wife and looted my home while I was on vacation! You\'re a jerk!',0),
	(414,206,'Blathering Bill',NULL,'Well, you know that I was diagnosed with stage four lung cancer last month. How cruel and insensitive of you to insult a cancer patient! I\'m not gonna put up with your disrespect and bigotry anymore. I\'m gonna kick your fuckin\' ass, you prick!',1),
	(415,207,'Mara Wilaford','Black Lives Matter protestor','If you do not listen to her (Marissa Johnson), your event will be shut down right now!',0),
	(416,207,'Marissa Johnson','Black Lives Matter protestor','We\'re gonna honor the fact that I have to fight through all these people to say \'my life matters!\' That I have to get up here in front of a bunch of sreaming white racists to say my heart fucking cares!.',1),
	(417,208,'Blathering Bill',NULL,'The more firefighters that are sent to a fire, the more damage that tends to be done. Firefighters are arsenists.',0),
	(418,209,'Brad Gouthro','Host @ <a href=\"https://www.youtube.com/channel/UCwxklfO1LBHPdkcUkzY9duQ\" target=\"_blank\">Live Lean TV</a>','The average caveman was tall, lean and athletic and compare that to today\'s average man or person. Overweight. Out of shape. On the verge of numerous diseases. The change in nutrition has had a huge impact on this. We\'ve moved from eating plants and animal to eating products filled withed refined grains and sugar.',0),
	(419,210,'Blathering Bill',NULL,'The players on the Detroit Lions must be pretty bad because the team loses so many games.',0),
	(420,211,'Rational Rob',NULL,'The Theory of Evolution should be taught in schools.',0),
	(421,211,'Blathering Bill',NULL,'No, it shouldn\'t because, by your own admission, it is only a theory!',1),
	(422,212,'Deepak Chopra','Author','In the absence of a conscious entity, the moon remains a radically ambiguous and ceaselessly flowing quantum soup.',0),
	(423,213,'Blathering Bill',NULL,'Rob claimed that his car gets the best gas mileage because his favorite football player endorsed it. He must be wrong. Doesn\'t he know that\'s an argument from authority?',0),
	(424,214,'Deepak Chopra','Author','I just want to quote from Einstein. \'Science without religion is lame, religion without science is blind.\' From Steven Hawking: \'It would be very difficult to explain why the universe would have begun just this way, except as the act of a god who intended to create beings like us.\'',0),
	(425,215,'Rational Rob',NULL,'Mike is a lot like Dave, because they both wear fedoras. Come to think of it, Mike owes me some money...',0),
	(426,215,'Blathering Bill',NULL,'I wouldn\'t trust Mike if I were you.',1),
	(427,216,'Blathering Bill',NULL,'I haven\'t hit a jackpot on this slot machine after a whole hour of playing. I\'m gonna keep playing because a jackpot is really overdue.',0),
	(428,217,'Megyn Kelly','Television host','Who is going to protect the community if we abolish the police?',0),
	(429,218,'Blathering Bill',NULL,'People from Los Angeles are crazy. My old roommate was from there and he did some pretty crazy things.',0),
	(430,219,'Julie Bindel','Feminist','Dear misogynist trolls I\'m going to make things easier for you - save u some time. All men are rapists and should be put in prison then shot.',0),
	(431,220,'Blathering Bill','','Hey Rob, could you do me a favor and help me install Google Chrome on my new Macbook? I don\'t like using Safari.',0),
	(432,220,'Rational Rob','','Sure, Bill. It\'s as easy as pie!',1),
	(433,220,'Blathering Bill','','Good to know what your opinion of bakers really is. Let me tell straight up, the job of a baker is anything but easy! Contrary to what you think, we work really hard, you bigot!',2),
	(434,221,'Sam Harris','Author, Neuroscientist','We\'ve been sold this meme of Islamaphobia where every criticism of the doctrine of Islam gets conflated with bogotry towards Muslims as people.',0),
	(435,221,'Ben Affleck','Actor','That\'s gross! That\'s racist!',1),
	(436,222,'Deepak Chopra','Author','I have to say, sorry for being so combatative. That was because of Michael Shermer. But, I actually agree. I actually... I actually agree with almost everything you\'ve said, Sam. I have no disagreement with the deeper truth that you are hinting at. I am just saying is that this conversation needs to take place in a setting such as this where it can lead to other conversations so that this is not a debate but a dialectic where through these constradictoruy points of view, we arrive at a greater truth.',0),
	(437,223,'Blathering Bill',NULL,'It is obvious that the sun goes around the Earth. Copernicus was wrong. His ideas about the Earth going around the sun are too far-fetched to be true. I don\'t believe that.',0),
	(438,224,'Blathering Bill',NULL,'Nobody goes to that strip club anymore.  It\'s too crowded.',0),
	(439,225,'Chris Smith','Journalist','Do you think there should be a draft?',0),
	(440,225,'Jon Stewart','Television host','I do. I absolutely do. I’ve watched military families suffer in a way that is unconscionable considering the demands that we have placed on them over this ten-year period. When I say there should be a draft, I also think it should be noncompulsory military.',1),
	(441,226,'Blathering Bill',NULL,'Rob, do you still cheat on your wife?',0),
	(442,228,'Blathering Bill',NULL,'If you were an honest, upstanding man of integrity, you\'d most certainly support the Patriot Act!',0),
	(443,228,'Rational Rob',NULL,'But, what about the sacrifice of civil liberties?',1),
	(444,228,'Blathering Bill',NULL,'Are you really selfish enough to complain about your civil liberties when there are people out there dying in terrorist attacks very day?',2),
	(445,229,'Samantha Schacher','Host of <a href=\"https://www.youtube.com/user/popCultured\">Pop Trigger</a>','I believe that Caitlyn Jenner, bringing this conversation to the forefront is saving lives! And at the end of the day, can you look at the fact that more than 50 percent of transgender youth attempt suicide because of discrimination. Because of shame. Does that try to alter the way that you, you... how, how, how, how you just try to project your, your thoughts? What if they\'re watching right now? What if there\'s a teen out watching right now that is struggling with who they are living their truth?',0),
	(446,229,'Ben Shapiro','Attonrey','Let\'s talk about some of the biological facts for one second.',1),
	(447,229,'Samantha Schacher','Host of <a href=\"https://www.youtube.com/user/popCultured\">Pop Trigger</a>','No! I want you to answer me. What would you say to a teen right now that, that really believes 100 percent...',2),
	(448,229,'Ben Shapiro','Attonrey','Allow me to answer your question.',3),
	(449,229,'Samantha Schacher','Host of <a href=\"https://www.youtube.com/user/popCultured\">Pop Trigger</a>','I, I, I am full of emotion right now because people die. Clearly, clearly it doesn\'t bother you because you\'re sitting their stone faced and cold hearted.',4),
	(450,230,'Blathering Bill',NULL,'Okay, so you don\'t find any association between the mercury preservative in vaccines, but what about the aluminum?',0),
	(451,231,'Blathering Bill',NULL,'The Flu vaccine only works 65% of the time. Don\'t waste your time getting this.',0),
	(452,232,'Blathering Bill',NULL,'An American would never surrender to an enemy.',0),
	(453,232,'Rational Rob',NULL,'Really? In World War II, many of our soldiers surrendered.',1),
	(454,232,'Blathering Bill',NULL,'Well, they weren\'t true Americans!',2),
	(455,233,'George W. Bush','Former President of the United States','The face of terror is not the true faith of Islam. That’s not what Islam is all about. Islam is peace.',0),
	(456,235,'Blathering Bill',NULL,'My kids both got their Meningitis shot when they were 16. Right after that, they both got speeding tickets.  That shot must cause people to drive recklessly!',0),
	(457,236,'Food Babe (Vani Hari)','Nutrition blogger, activist','Everyone says appendicitis is this random occurence. They say it could just hit any America or anybody, for that matter. But, I don\'t think it\'s random because it\'s definitely related to your digestive system and I was overloading my digestive system with tons of toxins. I mean, I was eating... the day before this all, this pain happened I was eating a Chick-Fil-A sandwich and it has, I found out it has over 100 ingredients in it. And one of those ingredients, the first ingredient was like MSG, you know?',0),
	(458,237,'Blathering Bill',NULL,'Of course all of the so-called \'experts\' claim that vaccines are safe. They have to say that because they are being paid off or blackmailed by the pharmaceutical industry.',0),
	(459,239,'Blathering Bill',NULL,'I drank way too much lastnight. I\'ve got a massive headache. My head is killing me!',0),
	(460,239,'Rational Rob',NULL,'You should take some aspirin. It\'ll help.',1),
	(461,239,'Blathering Bill',NULL,'Ha! So you can maximize your dividends from Bayer?',2),
	(462,240,'Larry King','Television host','Why would a doctor not want to know more about something [vaccines] that could save a life or prevent a disease?',0),
	(463,240,'Jim Carrey','Actor','The AAP is financed by the drug companies. Medical drugs are financied by the drug companies. This is a huge business. Vaccines are the largest growing division of the pharmaceutical industry. Thirteen billion dollars.',1),
	(464,241,'Blathering Bill',NULL,'We can\'t allow kids to wear tee shirts to school. This casual kind of dress will lead to lazier attitudes about school.  Lazy attitudes will lead to poor grades. When kids get poor grades, their self-esteem will go down.  This will cause them to do drugs and commit crimes. I don\'t know about you, but I want our kids to go to college, not prison!',0),
	(465,242,'Bell Hooks','Feminist activist, Author',' If women do not have the right to choose what happens to our bodies we risk relinquishing rights in all other areas of our lives.',0),
	(466,243,'Rational Rob',NULL,'Do you really think it\'s a good idea to quit your stable job and move out to Hollywood with the hopes of becoming the next Tom Cruise? Every year, thousands of people do the same exact thing only to become disappointed.',0),
	(467,243,'Blathering Bill',NULL,'Yeah, but those people probably weren\'t as good looking and motivated as I am!',1),
	(468,244,'Nick Gillespie','Journalist','There are not know health risks associated with GMO\'s. Why shouldn\'t the labeling be voluntary?',0),
	(469,244,'Bill Maher','Television host','Right. Let\'s trust the corporations to put people\'s health above profit.',1),
	(470,244,'Nick Gillespie','Journalist','That\'s not what I\'m saying.',2),
	(471,246,'Blathering Bill','','I\'m really disappointed in the US\'s drone stike program.',0),
	(472,246,'Rational Rob','','Me too',1),
	(473,246,'Blathering Bill','','Well, I vote. I voted for Obama twice. You\'ve never voted. Therefore you don\'t have the right to complain.',2),
	(474,246,'Rational Rob','','So, you helped elect a man into office that created the very program that you\'re complaining about? Seems to me that you\'re the one who doesn\'t have a right to complain; not me.',3),
	(475,247,'James Van Praagh','Psychic','Everyone has to question things, yes. But, don\'t be close minded; be open minded. See that life continues on. There are no endings; only beginnings.',0),
	(476,248,'Blathering Bill',NULL,'I always know when my woman is lying to me!',0),
	(477,248,'Rational Rob','','Didn\'t she just confess to having a secret affair?',1),
	(478,249,'Wolf Blitzer','News anchor','At least 15 police officers have been hurt. 200 arrests. 144 vehicle fires that these are statistics local police have put out 15 structure fires. There\'s no excuse for that kind of violence, right?',0),
	(479,249,'DeRay Mckesson','Black Lives Matter activist','Yeah, and there\'s no excuse for the 7 people that the Baltimore Police Department has killed within the past year either, right?',1),
	(480,250,'Blathering Bill',NULL,'Orderliness imparts reality to a symbolic representation of acceptance.',0),
	(481,251,'Zach Mason','Student','One of the big problems in the 21 century, for the American people is that issue of fear. Now, when you\'re stting at a table, I believe in God, alright. And there are many people who are atheists who are my friends. Forget the pun, but I could break bread with them. But, the issue here today is... why, if going to make policy in the Middle East, one of the biggest components of that are religious leaders and yet, here today you are saying let\'s use these belligerent words. Let\'s use cold and capircious words and say this is the way it has to be written. How do you respond on that? ',0),
	(482,251,'Christopher Hitchens','Author, Public Intellectual','Don\'t understand a blind word you\'re saying.',1),
	(483,252,'Blathering Bill','','I sure as hell hope you don\'t get that damn promotion at your job!',0),
	(484,252,'Rational Rob','','Why?',1),
	(485,252,'Blathering Bill','','Because that means I\'ll get paid less at my job. When you make more money, myself and everyone else makes less!',2),
	(486,253,'Bud Fox','Stock broker','How much is enough?',0),
	(487,253,'Gordon Gekko','Corporate Raider','It\'s not a question of enough, pal. It\'s a zero sum game, somebody wins, somebody loses. Money itself isn\'t lost or made, it\'s simply transferred from one perception to another.',1);

/*!40000 ALTER TABLE `fallacy_dialogues` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table fallacy_threads
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fallacy_threads`;

CREATE TABLE `fallacy_threads` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fallacy_id` int(11) DEFAULT NULL,
  `source` text,
  `type` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `fallacy_threads` WRITE;
/*!40000 ALTER TABLE `fallacy_threads` DISABLE KEYS */;

INSERT INTO `fallacy_threads` (`id`, `fallacy_id`, `source`, `type`)
VALUES
	(175,113,NULL,'basic'),
	(176,113,'https://youtu.be/YU3vcvGpALQ?t=669','prominent'),
	(177,114,NULL,'basic'),
	(178,115,NULL,'basic'),
	(179,116,NULL,'basic'),
	(180,116,'https://twitter.com/prisonplanet/status/704301059544641536','prominent'),
	(181,117,NULL,'basic'),
	(182,117,'https://youtu.be/GA5DKtiNcgI?t=96','prominent'),
	(183,118,NULL,'basic'),
	(184,119,NULL,'basic'),
	(185,120,NULL,'basic'),
	(186,120,'https://youtu.be/XNeSUs4TTNc?t=2700','prominent'),
	(187,121,NULL,'basic'),
	(188,121,'https://youtu.be/-DE_WOCHITk?t=310','prominent'),
	(189,122,NULL,'basic'),
	(190,123,NULL,'basic'),
	(191,123,'https://youtu.be/dW3izWSmU_E?t=217','prominent'),
	(192,124,NULL,'basic'),
	(193,125,'https://youtu.be/_XZvMwcluEg?t=54','prominent'),
	(194,126,NULL,'basic'),
	(195,127,NULL,'basic'),
	(196,128,NULL,'basic'),
	(197,128,'https://www.instagram.com/p/BJo4Jc8jci0/','prominent'),
	(198,129,NULL,'basic'),
	(199,130,NULL,'basic'),
	(200,130,'http://www.nytimes.com/2001/09/14/opinion/reckonings-after-the-horror.html','prominent'),
	(201,131,NULL,'basic'),
	(202,131,'https://youtu.be/_cUDl_LEtak?t=3155','prominent'),
	(203,132,NULL,'basic'),
	(204,133,NULL,'basic'),
	(205,134,'https://youtu.be/KsrtuvxDfrs?t=42','prominent'),
	(206,135,NULL,'basic'),
	(207,135,'https://youtu.be/HzU2zf1PJ_0?t=79','prominent'),
	(208,136,NULL,'basic'),
	(209,136,'https://youtu.be/RRCgH9ZQj2o?t=80','prominent'),
	(210,137,NULL,'basic'),
	(211,138,NULL,'basic'),
	(212,138,'https://youtu.be/0E99BdOfxAE?t=1772','prominent'),
	(213,139,NULL,'basic'),
	(214,140,'https://youtu.be/0E99BdOfxAE?t=1503','prominent'),
	(215,141,NULL,'basic'),
	(216,142,NULL,'basic'),
	(217,143,'https://youtu.be/EDLV-foRw7Y?t=125','prominent'),
	(218,144,NULL,'basic'),
	(219,144,'https://twitter.com/bindelj/status/765209117837451264','prominent'),
	(220,145,NULL,'basic'),
	(221,145,'https://youtu.be/vln9D81eO60','prominent'),
	(222,146,'https://youtu.be/0E99BdOfxAE?t=2715','prominent'),
	(223,147,NULL,'basic'),
	(224,148,NULL,'basic'),
	(225,148,'http://nymag.com/daily/intelligencer/2014/10/jon-stewart-rosewater-in-conversation.html','prominent'),
	(226,149,NULL,'basic'),
	(227,150,NULL,'basic'),
	(228,151,NULL,'basic'),
	(229,151,'https://youtu.be/-DE_WOCHITk?t=681','prominent'),
	(230,152,NULL,'basic'),
	(231,153,NULL,'basic'),
	(232,154,NULL,'basic'),
	(233,154,'https://youtu.be/liudIJFg8UQ?t=114','prominent'),
	(234,155,NULL,'basic'),
	(235,156,NULL,'basic'),
	(236,156,'https://youtu.be/znK1SeAZ7JU?t=283','prominent'),
	(237,157,NULL,'basic'),
	(238,158,NULL,'basic'),
	(239,159,NULL,'basic'),
	(240,159,'https://youtu.be/HX-SCdjDOrA?t=270','prominent'),
	(241,160,NULL,'basic'),
	(242,160,'https://excoradfeminisms.files.wordpress.com/2010/03/bell_hooks-feminism_is_for_everybody.pdf','prominent'),
	(243,161,NULL,'basic'),
	(244,162,'https://youtu.be/csSw3fYnICc?t=216','prominent'),
	(245,163,NULL,'basic'),
	(246,164,NULL,'basic'),
	(247,164,'https://youtu.be/3Ax_VuNTcZw?t=256','prominent'),
	(248,165,NULL,'basic'),
	(249,166,'https://youtu.be/NyYdKD0af78?t=62','prominent'),
	(250,167,NULL,'basic'),
	(251,167,'https://youtu.be/ARXtQ9rRhA0?t=1302','prominent'),
	(252,168,NULL,'basic'),
	(253,168,'https://youtu.be/4GA8MQGvr_U','prominent');

/*!40000 ALTER TABLE `fallacy_threads` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table fb_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fb_users`;

CREATE TABLE `fb_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `fb_id` bigint(20) DEFAULT NULL,
  `fb_access_token` varchar(255) DEFAULT NULL,
  `date_linked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `fb_users` WRITE;
/*!40000 ALTER TABLE `fb_users` DISABLE KEYS */;

INSERT INTO `fb_users` (`id`, `user_id`, `fb_id`, `fb_access_token`, `date_linked`)
VALUES
	(1,15,10103189890905008,'EAAHFcvEzr1sBAHIIQ6NVpf92btZCoqIEhYFWp9LlEVbR8X6Ng8cdHem6HxMyA3W6qICSIDnlfrmyZAujkUAHrcZCZCifIeYyOpXbxMxEx9cKBgsFExVksq97wqFKiUP1096JiSy5EuSlAPHNcxGjTZALNEwLCHqcZD','2016-09-30 13:22:16');

/*!40000 ALTER TABLE `fb_users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table influences
# ------------------------------------------------------------

DROP TABLE IF EXISTS `influences`;

CREATE TABLE `influences` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `social_media_id` bigint(11) DEFAULT NULL,
  `social_media_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table pages
# ------------------------------------------------------------

DROP TABLE IF EXISTS `pages`;

CREATE TABLE `pages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `social_media_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `profile_pic` text,
  `cover_pic` text,
  `username` varchar(255) DEFAULT NULL,
  `about` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;

INSERT INTO `pages` (`id`, `type`, `social_media_id`, `name`, `profile_pic`, `cover_pic`, `username`, `about`)
VALUES
	(2,'fb','117713628271096','Lana Del Rey','https://scontent.xx.fbcdn.net/v/t1.0-1/p160x160/12742564_1077648845610898_2265108535479394650_n.jpg?oh=96db69c7ee2a1c55f3b34fa945b10aa6&oe=583E5553','https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/12042757_997195790322871_7283482748561580117_n.jpg?oh=fcb6130e1be94fc28a3e858316dd7b6a&oe=587E4548','lanadelrey','0'),
	(5,'twitter','116994659','Sam Harris','https://pbs.twimg.com/profile_images/715180693/Headshot2_normal.jpg','https://pbs.twimg.com/profile_banners/116994659/1422118883','SamHarrisOrg','Author of The End of Faith, The Moral Landscape, Waking Up, and other books published in over 20 languages. Host of the Waking Up podcast.'),
	(7,'youtube','UCJdKr0Bgd_5saZYqLCa9mng','The Rubin Report','https://yt3.ggpht.com/-Ng-XFQGaAqM/AAAAAAAAAAI/AAAAAAAAAAA/L1Q-jVOODws/s240-c-k-no-mo-rj-c0xffffff/photo.jpg','https://yt3.ggpht.com/-BNPD2-MpgoU/V4jsLfg_BfI/AAAAAAAAAeA/pn1d0aEMCZUc4TduHP36xg6j08_KZADpQCL8B/w1060-fcrop64=1,00005a57ffffa5a8-nd-c0xffffffff-rj-k-no/rubin_youtube_v3.png','rubinreport','Care about free speech? Tired of political correctness? Like discussions about big ideas? Watch Dave Rubin on The Rubin Report. Real conversations, unfiltered rants, and one on one interviews with some of the most interesting names in news and entertainment. Thought leaders, authors, and comedians join Dave each week to break down the latest in politics and current events. Real people, real issues, real talk.\n\nClips air during the week and full episodes air on Fridays.\n\n► As of June 2016, The Rubin Report is powered by you, the viewers! The message that we\'re sharing about free speech, real conversation, and an honest exchange of ideas is connecting people all over the world. Now is your chance to be part of that message by contributing to our show which is fully fan-funded.\n\nClick below to subscribe, and find us on Patreon to support The Rubin Report.'),
	(8,'youtube',NULL,NULL,NULL,NULL,NULL,NULL),
	(9,'fb',NULL,NULL,NULL,NULL,NULL,NULL),
	(10,'fb','22457171014','Sam Harris','https://scontent.xx.fbcdn.net/v/t1.0-1/c0.20.160.160/p160x160/34571_443040806014_2043474_n.jpg?oh=777960e806dff356969e2b5b1590b03f&oe=58A8A67C','https://scontent.xx.fbcdn.net/t31.0-8/s720x720/10294968_10153123131796015_3214314131440714807_o.jpg','Sam-Harris-22457171014','Author of The End of Faith, The Moral Landscape, Waking Up, and other books published in over 20 languages. Host of the Waking Up podcast.'),
	(11,'twitter',NULL,NULL,NULL,NULL,NULL,NULL),
	(12,'twitter','16727535','Lance Armstrong','https://pbs.twimg.com/profile_images/749321742720512000/55qv6Pxr_normal.jpg',NULL,'lancearmstrong','Love the sūffer-fest.'),
	(13,'fb','135463036492497','Hulk Hogan','https://scontent.xx.fbcdn.net/v/t1.0-1/p160x160/12670828_1062077557164369_6891399825209532088_n.jpg?oh=da4de9c71ba4b809b2cde5bb8ed63eed&oe=586A8D3D','https://scontent.xx.fbcdn.net/v/t1.0-9/13077041_1077283095643815_6224836205603519112_n.jpg?oh=028caf8b1b75e8c7b0e11f7d7f25c6cf&oe=587BF034','hulkhogan','I am that I am!!'),
	(14,'fb','74286767824','Los Angeles International Airport (LAX)','https://scontent.xx.fbcdn.net/v/t1.0-1/p160x160/10250217_10152130974757825_8645405213175562082_n.jpg?oh=2b08b648878f94d0ef8629b2f21a5015&oe=586A37A2','https://scontent.xx.fbcdn.net/t31.0-8/s720x720/1403557_10152065360002825_1571967162_o.jpg','LAInternationalAirport','Welcome to the Facebook page for Los Angeles International Airport (LAX), 7th busiest airport in the world and 3rd in the U.S. and a gateway to the Pacific'),
	(15,'fb','45899773543','Lane Music','https://scontent.xx.fbcdn.net/v/t1.0-1/c215.42.530.530/s160x160/541680_10151554055918544_825008240_n.jpg?oh=79bb838c53cf44eea05f8cade0d7ff5c&oe=5866700E','https://scontent.xx.fbcdn.net/t31.0-0/p180x540/664410_10151241943318544_1574055017_o.jpg','lanemusic','SHOP ONLINE: http://www.lanemusic.com'),
	(16,'fb','1446078905621594','LANDR','https://scontent.xx.fbcdn.net/v/t1.0-1/p160x160/11145052_1622487567980726_7711244661543579528_n.jpg?oh=a2eaa1cd32a556a305cdbe2509669b6f&oe=587A4789','https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/14055090_1804861823076632_4677243872871045309_n.png?oh=b509850f296ff5f99ce63bc73a0eaf5a&oe=58626139','LANDRmusic','Affordable instant mastering. Making great sound accessible to everyone. Sound better. Share more. Get heard. Create a free account today.'),
	(17,'fb','309610212530844','Lance Beer','https://scontent.xx.fbcdn.net/v/t1.0-1/p160x160/13516548_601406563351206_6479206531775014843_n.jpg?oh=325ef8153fdb3efbba20ac5ed7e62692&oe=58609A3B','https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/13925280_627436997414829_4276049427310855907_n.jpg?oh=967a6d93e4118890661223487d3281e7&oe=5868F99D','lancebeerata','Lance Beer nasce com o desejo de transformar momentos especiais em experiências inesquecíveis. '),
	(18,'fb','1436354686635680','Mike Tyson','https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.160.160/p160x160/11174836_1575997296004751_4292656918776921479_n.jpg?oh=e0e8c3ebd938f6b86377c8030da734ab&oe=5875F765','https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/14045875_1769572909980521_5872867621190105944_n.jpg?oh=d39a3702c7c5c71dca63eb4d06cc91b1&oe=58785289','miketyson','The official fan page of Mike Tyson managed by Mike Tyson\'s team \nFollow Mike on:\nTwitter: https://twitter.com/MikeTyson\nInstagram: miketyson'),
	(19,'fb','458579090835055','Danny Glover','https://scontent.xx.fbcdn.net/v/t1.0-1/p160x160/13087575_1383180498374905_8514057264883026351_n.jpg?oh=330a6d4e67a71b8c80f10d31414b836e&oe=58A758FE','https://scontent.xx.fbcdn.net/v/t1.0-9/13529123_1438871432805811_914465039927198393_n.png?oh=dd218c4ad19ba1d8fe089697f3448531&oe=586B118C','DannyLGlover','Official page for Danny Glover, actor, producer, activist & humanitarian'),
	(20,'youtube','UC0H2oNkIc41pfVzqSdkuEIw','Lance Countdowns','https://yt3.ggpht.com/-UFq9gourR4g/AAAAAAAAAAI/AAAAAAAAAAA/eoZ5m6eo-Do/s240-c-k-no-mo-rj-c0xffffff/photo.jpg','https://yt3.ggpht.com/-NeUhqlk9BUU/VmeJRCqYJcI/AAAAAAAAABo/vcdaRa6DaGk/w1060-fcrop64=1,00005a57ffffa5a8-nd-c0xffffffff-rj-k-no/Final%2BBanner.png','lancecountdowns','Oi oi! I\'m Lance, a 17 year old Australian :]\n\nI upload Pokémon related countdown videos!\n\nhmu if you wanna collab yo.'),
	(21,'fb','11081890741','Disneyland','https://scontent.xx.fbcdn.net/v/t1.0-1/p160x160/166007_10151893268340742_1631350538_n.jpg?oh=2a48656386dfa7db70461ddf7153a816&oe=5867589D','https://scontent.xx.fbcdn.net/t31.0-8/s720x720/14310283_10154546045850742_4315019023193021343_o.jpg','Disneyland','Welcome to the official Facebook Page of the Disneyland Resort!   Learn about Park updates, news, and special backstage information here.'),
	(22,'youtube','UCmCHSxqI2jF3leCsMS9q-fg','LANCE!','https://yt3.ggpht.com/-cPD95cIXuWc/AAAAAAAAAAI/AAAAAAAAAAA/Pxi3DFxRAzQ/s240-c-k-no-mo-rj-c0xffffff/photo.jpg','https://yt3.ggpht.com/-G68nIVaTSbk/VCMiW6mua7I/AAAAAAAAIFo/aFgFr_cZ6B8/w1060-fcrop64=1,00005a57ffffa5a8-nd-c0xffffffff-rj-k-no/template-canal-youtube%2B%25282%2529.jpg','lanceTV','Um olhar diferenciado nos treinos dos principais clubes do Brasil. \n\nFlagras, lances polêmicos, entrevistas e o melhor do futebol.'),
	(23,'youtube','UCU1eJBwR1RLg50fB-lEt0AA','LATAM Airlines','https://yt3.ggpht.com/-K3jqLxp3sLg/AAAAAAAAAAI/AAAAAAAAAAA/zy_8XNhQTMs/s240-c-k-no-mo-rj-c0xffffff/photo.jpg','https://yt3.ggpht.com/-wwJoFHC3LZk/V8iTP--vUMI/AAAAAAAAAFc/9Xvtpf8BiPwY95OEJ_KfmgHlXqsGNQP7wCL8B/w1060-fcrop64=1,00005a57ffffa5a8-nd-c0xffffffff-rj-k-no/Cover-YT_2.png','latamairlineses','¡Bienvenido a bordo! Somos LATAM Airlines y estamos listos para llevar tus sueños cada vez más lejos.  Queremos inspirarte a escoger tu próximo destino. Te vamos a llevar desde Latinoamérica para el mundo e del mundo para Latinomérica.'),
	(24,'youtube','UCBjX47Pv0gG-EXF_ojmVx-g','AllSamHarrisContent','https://yt3.ggpht.com/-gWF54PBMMWw/AAAAAAAAAAI/AAAAAAAAAAA/67NqAoLtUrc/s240-c-k-no-mo-rj-c0xffffff/photo.jpg','https://yt3.ggpht.com/-4ZBFZTchEL8/U5Ovt-O5CZI/AAAAAAAAACo/0YomxjiQIAk/w1060-fcrop64=1,00005a57ffffa5a8-nd-c0xffffffff-rj-k-no/Black.png',NULL,'This is a fan-made channel.'),
	(25,'twitter','932196612','Vladimir Putin','https://pbs.twimg.com/profile_images/2821613356/a15ac328aca48742f6fea77546671b70_normal.jpeg','https://pbs.twimg.com/profile_banners/932196612/1423869506','PutinRF_Eng','The official twitter channel for President of the Russian Federation. Tweets from the President are signed #VP'),
	(26,'twitter','45055696','Colin Kaepernick','https://pbs.twimg.com/profile_images/456942552491380736/1lbU6hBl_normal.jpeg','https://pbs.twimg.com/profile_banners/45055696/1397778565','Kaepernick7',''),
	(27,'fb','145821335472117','Colin Kaepernick','https://scontent.xx.fbcdn.net/v/t1.0-1/c22.0.160.160/p160x160/10270440_656492147738364_8776710924075900103_n.jpg?oh=3d15fdf0c46de81dd1b6c85288d63461&oe=589B43DC','https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/1939498_656491257738453_8455397336926892611_n.jpg?oh=094366ba517d06506afa75b57a2e4e1e&oe=5861EA8B','kaepernick7','Official Colin Kaepernick Fan Page\nSan Francisco 49ers QB & Nike/MusclePharm Athlete | www.kaepernick7.com\nwww.nikefootball.com | www.musclepharm.com \n');

/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table twitter_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `twitter_users`;

CREATE TABLE `twitter_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `twitter_id` int(11) DEFAULT NULL,
  `twitter_username` varchar(255) DEFAULT NULL,
  `twitter_access_token` varchar(255) DEFAULT '',
  `twitter_access_secret` varchar(255) DEFAULT NULL,
  `date_linked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `twitter_users` WRITE;
/*!40000 ALTER TABLE `twitter_users` DISABLE KEYS */;

INSERT INTO `twitter_users` (`id`, `user_id`, `twitter_id`, `twitter_username`, `twitter_access_token`, `twitter_access_secret`, `date_linked`)
VALUES
	(2,15,2147483647,'lgnewman1','758108534802374657-ch5nyNHt1Sqjqzmh0MOvp5O7REgvDWE','xb1DQVRDo29QHdQN8qPPGz4FyFZYivNZZkoI29PL6gbyC','2016-10-16 20:21:30'),
	(3,16,2147483647,'lgnewman1','758108534802374657-ch5nyNHt1Sqjqzmh0MOvp5O7REgvDWE',NULL,'2016-09-25 18:48:26');

/*!40000 ALTER TABLE `twitter_users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `img` text,
  `bio` text,
  `email` varchar(255) DEFAULT NULL,
  `email_verified` int(1) DEFAULT NULL,
  `linked_youtube` int(1) DEFAULT NULL,
  `linked_fb` int(1) DEFAULT NULL,
  `linked_twitter` int(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `first_name`, `last_name`, `password`, `img`, `bio`, `email`, `email_verified`, `linked_youtube`, `linked_fb`, `linked_twitter`)
VALUES
	(15,'Lance','Newman','ec0b68d10ff99020ad5619e3c81dddddea8c48fc',NULL,NULL,'lnlance09@gmail.com',NULL,1,1,1),
	(16,'Lance','Newman','ea14a155d4bd23a1ddc3772e8d13e7535656c2d2',NULL,NULL,'lgnewman@buffalo.edu',NULL,NULL,1,1);

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table youtube_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `youtube_users`;

CREATE TABLE `youtube_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `youtube_id` varchar(255) DEFAULT NULL,
  `youtube_access_token` varchar(255) DEFAULT NULL,
  `date_linked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `youtube_users` WRITE;
/*!40000 ALTER TABLE `youtube_users` DISABLE KEYS */;

INSERT INTO `youtube_users` (`id`, `user_id`, `youtube_id`, `youtube_access_token`, `date_linked`)
VALUES
	(4,15,'UCqDRoPfnZMAurbI4OKRXzIQ','ya29.CjB_A1USb6R1ZhxOSjQqecjxOEfWr2ewUL4TeVZnP730B6jLV2nEcEXxbx7r_HffY9Q','2016-10-17 03:31:50');

/*!40000 ALTER TABLE `youtube_users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
