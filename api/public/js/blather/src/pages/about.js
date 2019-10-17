import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { sendContactMsg } from "pages/actions/about"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { Follow } from "react-twitter-widgets"
import {
	Button,
	Container,
	Form,
	Header,
	List,
	Menu,
	Message,
	TextArea,
	Transition
} from "semantic-ui-react"
import fallacies from "fallacies.json"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class About extends Component {
	constructor(props) {
		super(props)
		this.state = {
			msg: "",
			messageSent: false
		}

		this.onChangeMsg = this.onChangeMsg.bind(this)
		this.sendContactMsg = this.sendContactMsg.bind(this)
	}

	componentDidMount() {}

	componentWillMount() {
		let tab = "about"
		if (this.props.match.params.tab) {
			tab = this.props.match.params.tab
		}
		this.setState({ activeItem: tab })
	}

	handleItemClick = (e, { name }) => {
		const link = name === "about" ? "/about" : `/about/${name}`
		this.props.history.push(`${link}`)
		this.setState({ activeItem: name })
	}

	onChangeMsg = (e, { value }) => this.setState({ msg: value })

	sendContactMsg = e => {
		if (this.state.msg !== "") {
			this.props.sendContactMsg({ msg: this.state.msg })
			this.setState({ msg: "" })
		}
	}

	render() {
		const { activeItem, msg } = this.state

		const AboutSection = () => (
			<div>
				<p>
					Blather is an educational tool that allows users to analyze and pinpoint the
					accuracy of claims made on social media. This site is meant to help people spot
					out erroneous logic so that similar arguments will not be made in the future.
					However, there are a number of factors that make this a difficult task.
				</p>
				<List bulleted>
					<List.Item>Cognitive dissonance</List.Item>
					<List.Item>Confirmation bias</List.Item>
					<List.Item>Conspiratorial thinking</List.Item>
					<List.Item>Ego</List.Item>
					<List.Item>Fear or a reluctance to admit when we’re wrong</List.Item>
					<List.Item>Groupthink</List.Item>
					<List.Item>Ideology</List.Item>
					<List.Item>Ignorance</List.Item>
					<List.Item>Intellectual laziness</List.Item>
					<List.Item>Lack of self-awareness</List.Item>
					<List.Item>Political partisanship</List.Item>
					<List.Item>Style over substance</List.Item>
					<List.Item>Tradition</List.Item>
					<List.Item>Tribalism</List.Item>
				</List>
				<p>
					Unfortunately, all of those are baked into the human psyche and they help
					contribute to a toxic landscape that hinders perfectly sane people from engaging
					in honest, fact-based discussions. In essence, Blather is about restoring what
					it means to have a discussion; which is to change minds.
				</p>
				<Follow className="twitterFollowButton" username="blatherio" />
			</div>
		)

		const ContactSection = props => (
			<div>
				<Form
					className="contactForm"
					onSubmit={this.sendContactMsg}
					success={props.messageSent}
				>
					<Form.Field>
						<p>Drop us a message and let us know what's on your mind.</p>
						<TextArea
							className="contactTextarea"
							onChange={this.onChangeMsg}
							rows={8}
							value={msg}
						/>
					</Form.Field>
					<Transition visible={props.messageSent} animation="fade down" duration={500}>
						<Message
							content="You should receive a response within a few days"
							header="Message Sent"
							success
						/>
					</Transition>
					<Button color="blue" type="submit">
						Send
					</Button>
					<div className="clearfix" />
				</Form>
			</div>
		)

		const PrivacySection = () => (
			<div>
				<Header as="p" size="small">
					Google
				</Header>
				<p>
					If you choose to sign up with Google instead of signing up organically, Blather
					will store the following.
				</p>

				<List bulleted>
					<Menu.Item>Your first and last names</Menu.Item>
					<Menu.Item>Your profile picture</Menu.Item>
					<Menu.Item>Your Google ID</Menu.Item>
					<Menu.Item>Your email</Menu.Item>
				</List>

				<p>
					Those are used to make a basic profile on Blather for the person signing up.{" "}
					Your name and profile picture will be visible to anyone who views your profile
					on Blather. However, your Google ID and and email will not be made visible to
					anyone except the person who they belong to.
				</p>

				<Header as="p" size="small">
					YouTube
				</Header>
				<p>
					If you link your YouTube account to assign fallacies to videos, Blather will
					only store YouTube ID. That will not be shared with anyone. Linking your YouTube
					account with Blather is necessary so that basic information (title, description,
					and date uploaded) about the video that has been assigned a fallacy can be
					documented.
				</p>
			</div>
		)

		const RulesSection = () => (
			<div>
				<Header as="p" size="small">
					Conduct
				</Header>
				<p>
					As a user of Blather, you must put forth an honest attempt to understand
					different points of view. This applies to all users regardless of their
					ideologies. Personal insults should be avoided and racial slurs will not be
					tolerated.
				</p>

				<Header as="p" size="small">
					Content
				</Header>
				<p>
					Content on Blather comes from Tweets and videos and comments from YouTube. Once
					a piece of content has been viewed on Blather it gets saved in our database and
					becomes viewable to anyone whether or not they are a member. However, you must
					be a member to assign a fallacy to a piece of content. Tweets, videos and
					comments can be archived with{" "}
					<a href="http://archive.is" rel="noopener noreferrer" target="_blank">
						archive.is
					</a>{" "}
					so that if someone deletes their content in an attempt to save face there is
					still a record of it.
				</p>

				<Header as="p" size="small">
					Fallacies
				</Header>
				<p>
					Currently, users may pick one out of{" "}
					<Link to="/fallacies">{fallacies.length} fallacies</Link> to assign to a piece
					of content. The fallacies that you assign are viewable to everyone including
					people who are not signed up with Blather. Please make sure that you actually
					understand what the fallacy means before assigning it.
				</p>
			</div>
		)

		const showContent = props => {
			switch (activeItem) {
				case "about":
					return <div>{AboutSection()}</div>
				case "contact":
					return <div>{ContactSection(props)}</div>
				case "privacy":
					return <div>{PrivacySection()}</div>
				case "rules":
					return <div>{RulesSection()}</div>
				default:
					return null
			}
		}

		return (
			<Provider store={store}>
				<div className="aboutPage">
					<DisplayMetaTags page="about" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						<Header as="h1">About Blather</Header>
						<Menu pointing secondary>
							<Menu.Item
								active={activeItem === "about"}
								name="about"
								onClick={this.handleItemClick}
							/>
							<Menu.Item
								active={activeItem === "rules"}
								name="rules"
								onClick={this.handleItemClick}
							/>
							<Menu.Item
								active={activeItem === "privacy"}
								name="privacy"
								onClick={this.handleItemClick}
							/>
							<Menu.Item
								active={activeItem === "contact"}
								name="contact"
								onClick={this.handleItemClick}
							/>
						</Menu>
						<Container className="aboutContainer">{showContent(this.props)}</Container>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

About.propTypes = {
	messageSent: PropTypes.bool,
	sendContactMsg: PropTypes.func
}

About.defaultProps = {
	messageSent: false,
	sendContactMsg
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.about,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		sendContactMsg
	}
)(About)
