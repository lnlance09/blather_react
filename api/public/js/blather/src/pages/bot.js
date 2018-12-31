import "pages/css/index.css"
import "components/tweet/v1/style.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import React, { Component } from "react"
import { Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Card,
	Container,
	Divider,
	Grid,
	Header,
	Image,
	Label,
	List,
	Radio,
	Responsive
} from "semantic-ui-react"
import ProfilePic from "images/trump-fanboy.png"
import ItemPic from "images/square-image.png"
import Logo from "components/header/v1/images/logo.svg"
import ReactSVG from "react-svg"
import Typist from "react-typist"
import store from "store"

class Bot extends Component {
	constructor(props) {
		super(props)
		this.state = {
			grammar: true,
			id: 0,
			text: "Your just a beta male cuck. did u run to your Safe Space you Libtard snowflake?"
		}
	}

	determineText = (grammar, id) => {
		let text = ""
		switch (id) {
			case 1:
				text = grammar
					? "Your just a beta male cuck. did u run to your Safe Space you Libtard snowflake?"
					: "You're just a beta male cuck. Did you run to your safe space, you libtard snowflake?"
				break
			case 2:
				text = grammar
					? "All these Leftists talking about how expensive Health Care in America is. If they dont like it they should just Move to Venezuela."
					: "All these leftists talking about how expensive health care in America is. If they don't like it they should just move to Venezuela."
				break
			case 3:
				text = grammar
					? "Leftists love to complain about Capitalism and income Inequality yet most of them have an iPhone. Hypocrisy much?"
					: "Leftists love to complain about capitalism and income inequality yet most of them have iPhones. Hypocrisy much?"
				break
			case 4:
				text = grammar
					? "When people come in too this Country illegally its a huge slap in the Face to all the People who waited to become Citizens the LEGAL way!"
					: "When people come into this country illegally it's a huge slap in the face to all of the people who waited to become citizens the LEGAL way!"
				break
			case 5:
				text = grammar
					? "Im not against Immigration. I'm against ILLEGAL immigration. Follow the Law!"
					: "I'm not against immigration. I'm against ILLEGAL immigration. Follow the law!"
				break
			case 6:
				text = "CNN is FAKE NEWS!"
				break
			case 7:
				text = grammar
					? "Leftists making a Big Deal about Trump colluding with Russia. What about Hillary's Private e-mail server?"
					: "Leftists making a big deal about Trump colluding with Russia. What about Hillary's private email server?"
				break
			case 8:
				text = grammar
					? "Immigrants shouldnt get 1 Dime in Welfare Benefits until there are Zero homless Vets in America!"
					: "Immigrants shouldn't get one dime in welfare benefits until there are zero homless vets in America!"
				break
			case 9:
				text = grammar
					? "Im not a White Supremacist. I already must of admitted many times that Asians get better grades in school then Whites"
					: "I'm not a white supremacist. I already must have admitted many times that Asians get better grades in school than whites"
				break
			case 10:
				text = grammar
					? "Alex Jones was Banned from YouTube for Speaking the TRUTH. This is Exactly how you know the Globalists are scared shitless. There afraid people will start Waking up and theyre starting to panic"
					: "Alex Jones was banned from YouTube for speaking the TRUTH. This is exactly how you know the globalists are scared shitless. They're afraid people will start waking up and they're starting to panic."
				break
			case 11:
				text = grammar
					? "DemoKKKrats were the Party of slavery. The party of Jim Crow. The party of Lynchings and the KKK. After all these years, they still think they own Black people. Fortunately, I escaped the Leftist plantation."
					: "DemoKKKrats were the party of slavery. The party of Jim Crow. The party of lynchings and the KKK. After all these years, they still think they own black people. Fortunately, I escaped the leftist plantation."
				break
			case 13:
				text = grammar
					? "The most valuable asset in SJW circles is Victimhood. There always trying to win the Oppression Olympics. Fuck them for Perpetuating grievance culture."
					: "The most valuable asset in SJW circles is victimhood. They're always trying to win the oppression olympics. Fuck them for perpetuating grievance culture."
				break
			case 14:
				text = grammar
					? "Liberals always prove to be the Intolerant ones when they chose to boycott Companies simply because they disagree with them. Theyre always trying to Virtue Signal how tolerant they are by not eating at chick-filA because they care about Gay people so much"
					: "Liberals always prove to be the intolerant ones when they choose to boycott companies simply because they disagree with them. They're always trying to virtue signal how tolerant they are by not eating at Chick-fil-A because they care about gay people so much."
				break
			case 15:
				text = grammar
					? "The supreme court decision about the Gay Wedding cake must have libs really triggered. Private Companies have the right to refuse service. If you dont like a companies policy then take your business somehwere else. Its that simple. Thats the beautiful of the free market."
					: "The Supreme Court decision about the gay wedding cake must have libs really triggered. Private companies have the right to refuse service. If you don't like a company's policy then take your business somehwere else. It's that simple. That's the beauty of the free market."
				break
			case 16:
				text = grammar
					? "There are only 2 Genders. Anyone how disagrees should pick up a highschool Biology text book. It isnt that hard"
					: "There are only 2 genders. Anyone who disagrees should pick up a high school biology text book. It isn't that hard."
				break
			case 17:
				text = grammar
					? "Unlike limousine Liberals, us Republicans actually do more then just Pretend to care about the Poor to make areselves look good Conservatives actually donate more too charity than Liberals."
					: "Unlike limousine liberals, us Republicans actually do more than just pretend to care about the poor to make ourselves look good. Conservatives actually donate more to charity than liberals."
				break
			case 18:
				text = grammar
					? "I wont ever give up my fire arms without a fight There protected by the 2nd amendment. The Government will have too take them from my cold dead hands"
					: "I won't ever give up my firearms without a fight. They're protected by the 2nd amendment. The government will have to take them from my cold dead hands."
				break
			case 19:
				text = grammar
					? "Im sick and Tired of Leftists who have no respect for are constitution. Guns are protecte by the Second Amendment Libtards should actually try reading the constitution for once"
					: "I'm sick and tired of leftists who have no respect for our constitution. Guns are protecte by the second amendment. Libtards should actually try reading the constitution for once."
				break
			case 20:
				text = grammar ? "BUILD THE WALL!!1" : "BUILD THE WALL!"
				break
			case 21:
				text = grammar
					? "Lol at the Libtards claiming Trump is a Nazi. His daughter and son in law are Jewish!"
					: "Lol at the libtards claiming Trump is a nazi. His daughter and son in law are both Jewish!"
				break
			case 22:
				text = grammar
					? "Leftists never have any Real Arguments so they have to resort to calling everyone who Disagrees with them Nazis and Racists"
					: "Leftists never have any real arguments so they have to resort to calling everyone who disagrees with them Nazis and racists."
				break

			case 24:
				text = grammar
					? "The Radical left is trying to tear down confederate Monuments and erase history Its heritage not hate Robert E Lee didnt even believe in Slavery"
					: "The radical left is trying to tear down confederate monuments and erase history. It's heritage not hate. Robert E. Lee didn't even believe in slavery."
				break
			case 25:
				text = grammar
					? "Let's see here Blacks get in too College easier because of Affirmative Action They get Jobs easier because of diversity Quotas They get welfare Benefits easier to White people are the REAL Victims. Amirite?"
					: "Let's see here. Blacks get into college easier because of affirmative action. They get jobs easier because of diversity quotas. They get welfare benefits easier. White people are the REAL victims. Am I right?"
				break
			case 26:
				text = grammar
					? "I will not Watch another NFL game until every single player kneels for the Anthem of the greatest Country on earth"
					: "I will not watch another NFL game until every single player kneels for the anthem of the greatest country on earth."
				break
			case 27:
				text = grammar
					? "google, face book, twitter and you tube are silencing Conservative voices. Its time for a Class action Lawsuit against them so they Respect our right too free speech"
					: "Google, Facebook, Twitter and YouTube are silencing conservative voices. It's time for a class action lawsuit against them so they respect our right to free speech."
				break
			case 28:
				text = grammar
					? "God Bless everyone this easter Sunday. Today we celebrate the Day in which Jesus rose from the Dead Christ has Risen. Only God can save us"
					: "God bless everyone this easter Sunday. Today we celebrate the day in which Jesus rose from the dead. Christ has risen. Only God can save us."
				break
			case 29:
				text = grammar
					? "Broke ass Socialist Alexandra Ocasio cortez cant even afford housing in washington DC Im just amazed that a Loser like this with no saving is in charge of making Important decisions."
					: "Broke ass socialist Alexandria Ocasio-Cortez can't even afford housing in Washington DC. I'm just amazed that a loser like this with no savings is in charge of making important decisions."
				break
			case 30:
				text = grammar
					? "If you resist Arrest then the police have the authority to do whatever is in their Power to take control of the Situation. If that includes shoting unarmed Citizens then so be it Dont ever resist Arrest. Just Follow orders."
					: "If you resist arrest then the police have the authority to do whatever is in their power to take control of the situation. If that includes shooting unarmed citizens then so be it. Don't ever resist arrest. Just follow orders."
				break
			case 31:
				text = grammar
					? "Its time to Abolish the 14 Amendment and get rid of birthright Citizenship No more anchor babies. Rule of Law and LEGAL immigration to this Country!"
					: "It's time to abolish the 14th amendment and get rid of birthright citizenship. No more anchor babies. Rule of law and LEGAL immigration to this country!"
				break
			case 32:
				text = grammar
					? "If Communism was so good then why did east berlin need to build a Wall to keep people from fleeing. Walls dont work"
					: "If communism was so good then why did East Berlin need to build a wall to keep people from fleeing? Walls don't work."
				break
			case 33:
				text = grammar
					? "Doesnt matter that george Soros is jewish. He Collaborated with the nazis as a kid and Victimized his own People"
					: "Doesn't matter that George Soros is Jewish. He collaborated with the Nazis as a kid and victimized his own people."
				break
			case 34:
				text = grammar
					? "Hillary Clinton is Racist Nazi scum. Why do u think she had such a close Relationship with former KKK member robert Byrd?"
					: "Hillary Clinton is racist Nazi scum. Why do you think she had such a close relationship with former KKK member Robert Byrd?"
				break

			case 35:
				text = grammar
					? "Obama let Millions of illegals flood over our Borders. He didnt care about Border security or rule of Law Typical for a Marxist Muslim like him."
					: "Obama let millions of illegals flood over our borders. He didn't care about border security or rule of law. Typical for a marxist muslim like him."
				break
			case 36:
				text = grammar
					? "Leftists keep talking about how Trump is Deporting lots of people and Breaking up families yet Obama deported more Illegals than any other President"
					: "Leftists keep talking about how Trump is deporting lots of people and breaking up families yet Obama deported more illegals than any other president."
				break
			case 37:
				text = grammar
					? "haha the Left cant Meme [insert your own NPC meme unironically]"
					: "Haha the left can't meme [insert your own NPC meme unironically]"
				break

			default:
				text = grammar
					? "Your just a beta male cuck. did u run out of soy you Libtard snowflake?"
					: "You're just a beta male cuck. Did you run out of soy, you libtard snowflake?"
		}
		return text
	}

	handleItemClick = (e, { id }) => {
		const text = this.determineText(this.state.grammar, id)
		this.setState({ id, text })
	}

	toggleGrammar = () => {
		const grammar = this.state.grammar ? false : true
		const text = this.determineText(grammar, this.state.id)
		this.setState({ grammar, text })
	}

	render() {
		const { grammar, text } = this.state
		const Tweet = () => (
			<div>
				<Card centered={false} className="tweet" fluid>
					<Card.Content>
						<div>
							<Image
								circular
								className="tweetUserImg"
								onError={i => (i.target.src = ItemPic)}
								floated="left"
								src={ProfilePic}
								width="200"
							/>
							<Card.Header className="tweetUserName">Trump Supporter</Card.Header>
							<Card.Meta className="tweetUserScreenName">
								@TrumpSupporter •<span className="tweetTime">Just now</span>
							</Card.Meta>
						</div>
						<Card.Description>
							<Typist>{text}</Typist>
						</Card.Description>
					</Card.Content>
				</Card>
				<div>
					<Radio
						checked={grammar}
						label="Shitty grammar mode"
						onChange={this.toggleGrammar}
						toggle
					/>
				</div>
			</div>
		)

		return (
			<Provider store={store}>
				<div className="loginContainer botPage">
					<DisplayMetaTags page="bot" props={this.props} state={this.state} />
					<Container className="signInPageHeader" textAlign="center">
						<ReactSVG
							className="mainLogo"
							evalScripts="always"
							onClick={() => {
								this.props.history.push("/")
							}}
							path={Logo}
							svgClassName="svgMainLogo"
						/>
					</Container>
					<Container className="tweetContainer">
						<Tweet />
						<div className="singleButtons">
							<Button color="olive" compact id={1} onClick={this.handleItemClick}>
								insult
							</Button>
							<Button color="olive" compact id={2} onClick={this.handleItemClick}>
								love it or leave it
							</Button>
							<Button color="olive" compact id={3} onClick={this.handleItemClick}>
								you own an iPhone
							</Button>
							<Button color="olive" compact id={4} onClick={this.handleItemClick}>
								don't cut in line
							</Button>
							<Button color="olive" compact id={5} onClick={this.handleItemClick}>
								LEGAL immigrants
							</Button>
							<Button color="olive" compact id={6} onClick={this.handleItemClick}>
								FAKE NEWS
							</Button>
							<Button color="olive" compact id={7} onClick={this.handleItemClick}>
								whataboutism
							</Button>
							<Button color="olive" compact id={8} onClick={this.handleItemClick}>
								homeless vets
							</Button>
							<Button color="olive" compact id={9} onClick={this.handleItemClick}>
								asians get better grades
							</Button>
							<Button color="olive" compact id={10} onClick={this.handleItemClick}>
								banned for speaking the TRUTH
							</Button>
							<Button color="olive" compact id={37} onClick={this.handleItemClick}>
								the left can't meme
							</Button>
						</div>

						<Responsive minWidth={1025}>
							<div className="pickOneContainer">
								<Button.Group fluid>
									<Button color="blue" id={11} onClick={this.handleItemClick}>
										Confederates were demoKKKrats
									</Button>
									<Button.Or />
									<Button color="red" id={24} onClick={this.handleItemClick}>
										Protect Confederate statues
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={13} onClick={this.handleItemClick}>
										SJWs love to be victims
									</Button>
									<Button.Or />
									<Button color="red" id={25} onClick={this.handleItemClick}>
										White people are the REAL victims
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={14} onClick={this.handleItemClick}>
										Libs boycott Chick-fil-A
									</Button>
									<Button.Or />
									<Button color="red" id={26} onClick={this.handleItemClick}>
										Boycott the NFL
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={15} onClick={this.handleItemClick}>
										Businesses have the right to refuse service
									</Button>
									<Button.Or />
									<Button color="red" id={27} onClick={this.handleItemClick}>
										Social media is banning conservatives
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={16} onClick={this.handleItemClick}>
										Leftists don't know biology
									</Button>
									<Button.Or />
									<Button color="red" id={28} onClick={this.handleItemClick}>
										Jesus rose from the dead
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={17} onClick={this.handleItemClick}>
										Republicans care about the working class
									</Button>
									<Button.Or />
									<Button color="red" id={29} onClick={this.handleItemClick}>
										AOC can't even afford housing
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={18} onClick={this.handleItemClick}>
										I won't give up my guns without a fight
									</Button>
									<Button.Or />
									<Button color="red" id={30} onClick={this.handleItemClick}>
										Don't ever resist arrest
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={19} onClick={this.handleItemClick}>
										Defend the constitution
									</Button>
									<Button.Or />
									<Button color="red" id={31} onClick={this.handleItemClick}>
										End birthright citizenship
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={20} onClick={this.handleItemClick}>
										Build the wall
									</Button>
									<Button.Or />
									<Button color="red" id={32} onClick={this.handleItemClick}>
										Communism is evil
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={21} onClick={this.handleItemClick}>
										Jared and Ivanka are Jewish
									</Button>
									<Button.Or />
									<Button color="red" id={33} onClick={this.handleItemClick}>
										Soros was a Nazi collaborator
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={22} onClick={this.handleItemClick}>
										Leftists say everyone who disagrees with them is a Nazi
									</Button>
									<Button.Or />
									<Button color="red" id={34} onClick={this.handleItemClick}>
										Hillary is a nazi
									</Button>
								</Button.Group>
								<Button.Group fluid>
									<Button color="blue" id={35} onClick={this.handleItemClick}>
										Obama was an open borders marxist
									</Button>
									<Button.Or />
									<Button color="red" id={36} onClick={this.handleItemClick}>
										Obama deported more than any other president
									</Button>
								</Button.Group>
							</div>
						</Responsive>

						<Responsive maxWidth={1024}>
							<Grid>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={11}
											onClick={this.handleItemClick}
										>
											Confederates were demoKKKrats
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={24}
											onClick={this.handleItemClick}
										>
											Protect Confederate statues
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={13}
											onClick={this.handleItemClick}
										>
											SJWs love to be victims
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={25}
											onClick={this.handleItemClick}
										>
											White people are the REAL victims
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={14}
											onClick={this.handleItemClick}
										>
											Libs boycott Chick-fil-A
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={26}
											onClick={this.handleItemClick}
										>
											Boycott the NFL
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={15}
											onClick={this.handleItemClick}
										>
											Businesses have the right to refuse service
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={27}
											onClick={this.handleItemClick}
										>
											Social media is banning conservatives
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={16}
											onClick={this.handleItemClick}
										>
											Leftists don't know biology
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={28}
											onClick={this.handleItemClick}
										>
											Jesus rose from the dead
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={17}
											onClick={this.handleItemClick}
										>
											Republicans care about the working class
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={29}
											onClick={this.handleItemClick}
										>
											AOC can't even afford housing
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={18}
											onClick={this.handleItemClick}
										>
											I won't give up my guns without a fight
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={30}
											onClick={this.handleItemClick}
										>
											Don't ever resist arrest
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={19}
											onClick={this.handleItemClick}
										>
											Defend the constitution
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={31}
											onClick={this.handleItemClick}
										>
											End birthright citizenship
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={20}
											onClick={this.handleItemClick}
										>
											Build the wall
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={32}
											onClick={this.handleItemClick}
										>
											Communism is evil
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={21}
											onClick={this.handleItemClick}
										>
											Jared and Ivanka are Jewish
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={33}
											onClick={this.handleItemClick}
										>
											Soros was a Nazi collaborator
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={22}
											onClick={this.handleItemClick}
										>
											Leftists say everyone who disagrees with them is a Nazi
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={34}
											onClick={this.handleItemClick}
										>
											Hillary and Obama are nazis
										</Button>
									</Grid.Column>
								</Grid.Row>
								<Grid.Row>
									<Grid.Column width={8}>
										<Button
											color="blue"
											compact
											fluid
											id={35}
											onClick={this.handleItemClick}
										>
											Obama was an open borders marxist
										</Button>
									</Grid.Column>
									<Grid.Column width={8}>
										<Button
											color="red"
											compact
											fluid
											id={36}
											onClick={this.handleItemClick}
										>
											Obama deported more than any other president
										</Button>
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Responsive>

						<Header as="h3" dividing>
							Fake news
						</Header>
						<Label.Group>
							<Label basic>New York Times</Label>
							<Label basic>Washington Post</Label>
							<Label basic>CNN</Label>
							<Label basic>MSNBC</Label>
							<Label basic>Any source that criticizes Trump</Label>
						</Label.Group>
						<Header as="h3" dividing>
							Real news
						</Header>
						<Label.Group>
							<Label basic>Info Wars</Label>
							<Label basic>Gateway Pundit</Label>
							<Label basic>Any source that doesn't criticize Trump</Label>
						</Label.Group>

						<Header as="h3" dividing>
							Insults
						</Header>
						<Label.Group>
							<Label basic>Beta male</Label>
							<Label basic>Cuck</Label>
							<Label basic>Globalist</Label>
							<Label basic>Leftist</Label>
							<Label basic>Communist</Label>
							<Label basic>Soy boy</Label>
							<Label basic>Libtard</Label>
						</Label.Group>
						<Header as="h3" dividing>
							Compliments
						</Header>
						<Label.Group>
							<Label basic>Patriot</Label>
						</Label.Group>

						<Header as="h3" dividing>
							Shitholes
						</Header>
						<Label.Group>
							<Label basic>New York City</Label>
							<Label basic>Los Angeles</Label>
							<Label basic>San Francisco</Label>
							<Label basic>Chicago</Label>
							<Label basic>Any cosmopolitan city</Label>
						</Label.Group>
						<Header as="h3" dividing>
							Paradise
						</Header>
						<Label.Group>
							<Label basic>Texas</Label>
							<Label basic>Alabama</Label>
							<Label basic>Mississippi</Label>
							<Label basic>Tennessee</Label>
							<Label basic>Bible Belt</Label>
							<Label basic>
								Just about any redneck town in the midwest or the south
							</Label>
						</Label.Group>
						<Divider horizontal />

						<Header as="h3" dividing>
							Who actually subscribes to this way of thinking?
						</Header>
						<div>
							<p>
								Although it may seem absurd to most that some people are partisan or
								delusional enough to actually subscribe to this black-or-white way
								of thinking, plenty of people in respectable positions do. In
								addition to the pundits listed below, a countless number of people
								on social media subscribe to this backwards way of thinking. This is
								evidenced by tweets, and comments and videos on YouTube and
								Facebook.
							</p>
							<List bulleted size="large">
								<List.Item>
									<Link to="/pages/twitter/TomiLahren">Tomi Lahren</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/charliekirk11">Charlie Kirk</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/RealCandaceO">Candace Owens</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/DineshDSouza">Dinesh D'Souza</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/Lauren_Southern">Lauren Southern</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/scrowder">Steven Crowder</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/TuckerCarlson">Tucker Carlson</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/PrisonPlanet">Paul Joseph Watson</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/Cernovich">Mike Cernovich</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/LouDobbs">Lou Dobbs</Link>
								</List.Item>
								<List.Item>
									<Link to="/pages/twitter/tedcruz">Ted Cruz</Link>
								</List.Item>
							</List>
						</div>
						<Divider horizontal />
					</Container>
				</div>
			</Provider>
		)
	}
}

export default Bot
