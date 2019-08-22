import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	Comment,
	Container,
	Grid,
	Header,
	Icon,
	Menu,
	Responsive,
	Segment
} from "semantic-ui-react"
import BillPic from "images/avatar/small/mark.png"
import fallacies from "fallacies.json"
import html2canvas from "html2canvas"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import RobPic from "images/avatar/small/matthew.png"
import store from "store"

class Fallacies extends Component {
	constructor(props) {
		super(props)

		const name = this.props.match.params.id
		const parsedName = name ? name.split("-").join(" ") : false
		this.state = {
			activeItem: parsedName ? parsedName : "ad hominem",
			intervalId: 0
		}
	}

	componentWillMount() {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	componentWillReceiveProps(props) {
		const name = props.match.params.id
		const parsedName = name ? name.split("-").join(" ") : false
		this.setState({ activeItem: parsedName ? parsedName : "ad hominem" })
	}

	captureScreenshot(id, filename) {
		html2canvas(document.getElementById(id), {
			scale: 2
		}).then(canvas => {
			const ctx = canvas.getContext("2d")
			ctx.globalAlpha = 1
			let img = canvas.toDataURL("image/png")
			let link = document.createElement("a")
			link.download =
				filename
					.toLowerCase()
					.split(" ")
					.join("-") + ".png"
			link.href = img
			link.click()
		})
	}

	handleItemClick = (e, { name }) => {
		this.scrollToTop()
		this.setState({ activeItem: name })
		this.props.history.push(`/fallacies/${name.split(" ").join("-")}`)
	}

	scrollStep() {
		if (this.props.match.path === "/fallacies/:id") {
			if (window.pageYOffset === 0) {
				clearInterval(this.state.intervalId)
			}
			window.scroll(0, window.pageYOffset - 50)
		}
	}

	scrollToTop() {
		let intervalId = setInterval(this.scrollStep.bind(this), "16.66")
		this.setState({ intervalId })
	}

	render() {
		const { activeItem } = this.state

		const FallaciesConversation = dialogue =>
			dialogue.map((item, i) => {
				const pic = item.name === "Blathering Bill" ? BillPic : RobPic
				return (
					<Comment key={`${item.name}_${i}`}>
						<Comment.Avatar src={pic} />
						<Comment.Content>
							<Comment.Author>{item.name}</Comment.Author>
							<Comment.Text>{item.message}</Comment.Text>
						</Comment.Content>
					</Comment>
				)
			})

		const FallaciesMain = fallacies.map((fallacy, i) => {
			if (fallacy.name.toLowerCase() === activeItem) {
				return (
					<div className="mainFallacy active" id={fallacy.id} key={fallacy.id}>
						<Segment>
							<Header as="p" size="medium">
								{fallacy.name}
							</Header>
							<p>{fallacy.description}</p>
							<Comment.Group>{FallaciesConversation(fallacy.dialogue)}</Comment.Group>
							<span
								className="captureScreenshot"
								data-html2canvas-ignore
								onClick={() => this.captureScreenshot(fallacy.id, fallacy.name)}
							>
								<Icon name="camera" /> capture screenshot
							</span>
							<Link
								data-html2canvas-ignore
								to={`/search/fallacies?fallacies=${fallacy.id}`}
							>
								view real examples
							</Link>
							<div className="clearfix" />
						</Segment>
					</div>
				)
			}
			return null
		})

		const FallaciesSidebar = fallacies.map(fallacy => (
			<Menu.Item
				active={activeItem === fallacy.name.toLowerCase()}
				key={fallacy.id}
				name={fallacy.name.toLowerCase()}
				onClick={this.handleItemClick}
			>
				{`${fallacy.name}`}
			</Menu.Item>
		))

		return (
			<Provider store={store}>
				<div className="fallaciesPage">
					<DisplayMetaTags page="fallacies" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container
						className="mainContainer"
						ref={this.handleContextRef}
						textAlign="left"
					>
						<Header as="h1" dividing>
							Fallacies
							<Header.Subheader>Plus a few other things...</Header.Subheader>
						</Header>

						<Responsive maxWidth={1024}>{FallaciesMain}</Responsive>

						<Responsive minWidth={1025}>
							<Grid>
								<Grid.Column width={4}>
									<Menu
										borderless
										className="fallaciesMenu"
										fluid
										secondary
										vertical
									>
										{FallaciesSidebar}
									</Menu>
								</Grid.Column>
								<Grid.Column className="rightSide" width={12}>
									{FallaciesMain}
								</Grid.Column>
							</Grid>
						</Responsive>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Fallacies.propTypes = {
	fallacies: PropTypes.object
}

export default Fallacies
