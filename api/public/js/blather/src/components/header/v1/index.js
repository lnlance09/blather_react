import "./style.css"
import { hyphenateText } from "utils/textFunctions"
import { logout } from "components/authentication/v1/actions"
import { Provider, connect } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Container,
	Divider,
	Dropdown,
	Grid,
	Icon,
	Image,
	Label,
	Menu,
	Responsive,
	Sidebar
} from "semantic-ui-react"
import ImagePic from "images/avatar/brain-fart.gif"
import LoadingBar from "react-redux-loading-bar"
import Logo from "./images/logo.svg"
import NavSearch from "components/search/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactSVG from "react-svg"
import store from "store"
import Url from "url-parse"

class Header extends Component {
	constructor(props) {
		super(props)
		this.state = {
			activeItem: "",
			fallacies: [],
			visible: false
		}

		this.onLogout = this.onLogout.bind(this)
	}

	componentDidMount() {
		this.getFallacies()
	}

	getFallacies = () => {
		return fetch(`${window.location.origin}/api/fallacies/getFallacyRefs`, {
			json: true
		})
			.then(response => {
				if (response.ok) {
					response.json().then(data => {
						this.setState({ fallacies: data.fallacies })
					})
				}
			})
			.catch(err => console.log(err))
	}

	handleItemClick = name => {
		this.setState({ activeItem: name, visible: false }, () => {
			const key = hyphenateText(name.toLowerCase())
			this.props.history.push(`/fallacies/${key}`)
		})
	}

	onLogout() {
		this.props.logout()
		const parsed = new Url(window.location)
		if (parsed.pathname !== "/") {
			window.location.reload()
		}
	}

	render() {
		const { activeItem, fallacies, visible } = this.state

		const SubHeader = (
			<Responsive className="responsive" maxWidth={1024}>
				<Menu borderless className="subHeader" fitted="vertically" fixed="top">
					<Container className="subHeaderContainer">
						<Menu.Item className="searchItem">
							<NavSearch history={this.props.history} width="100%" />
						</Menu.Item>
					</Container>
				</Menu>
			</Responsive>
		)

		const FallaciesSidebar = fallacies.map(fallacy => (
			<Menu.Item
				active={activeItem === fallacy.name.toLowerCase()}
				className="fallacySidebarItem"
				key={fallacy.id}
				name={fallacy.name.toLowerCase()}
				onClick={() => this.handleItemClick(fallacy.name)}
			>
				{fallacy.name}

				<Label color="red">{fallacy.count}</Label>
			</Menu.Item>
		))

		const LoginButton = props => {
			if (props.authenticated) {
				const trigger = (
					<Image
						avatar
						bordered
						circular
						onError={i => (i.target.src = ImagePic)}
						rounded
						src={props.data.img ? props.data.img : ImagePic}
					/>
				)

				return (
					<Menu.Item position="right">
						<Dropdown
							className="dropDownMenu"
							icon={false}
							pointing="top right"
							trigger={trigger}
						>
							<Dropdown.Menu>
								<Dropdown.Item
									onClick={() =>
										props.history.push(`/users/${props.data.username}`)
									}
									text={props.data.name}
								/>
								<Dropdown.Divider />
								<Dropdown.Item
									onClick={() =>
										props.history.push(
											`/users/${props.data.username}/fallacies`
										)
									}
									text="My Fallacies"
								/>
								<Dropdown.Item
									onClick={() =>
										props.history.push(`/users/${props.data.username}/archives`)
									}
									text="My Archives"
								/>
								<Dropdown.Divider />
								<Dropdown.Item
									onClick={() => props.history.push(`/settings`)}
									text="Settings"
								/>
								<Dropdown.Item onClick={this.onLogout} text="Log out" />
							</Dropdown.Menu>
						</Dropdown>
					</Menu.Item>
				)
			}

			return (
				<Menu.Item className="signInLink" direction="right" position="right">
					<Grid columns={2} relaxed="very">
						<Grid.Column>
							<Link to="/signin?type=signin">Sign In</Link>
						</Grid.Column>
						<Grid.Column>
							<Button
								color="green"
								content="Join"
								onClick={() => props.history.push("/signin?type=join")}
							/>
						</Grid.Column>
					</Grid>
					<Divider fitted vertical>
						or
					</Divider>
				</Menu.Item>
			)
		}

		return (
			<Provider store={store}>
				<div className="pageHeader">
					<Menu borderless className="globalHeader" fitted="vertically" fixed="top">
						<Container className="headerContainer">
							<Responsive className="responsive" maxWidth={1024}>
								<Menu.Item className="headerMenuItem">
									<ReactSVG
										className="headerLogo"
										evalScripts="always"
										onClick={() => {
											this.props.history.push("/activity")
										}}
										src={Logo}
										svgClassName="svgHeaderLogo"
									/>
								</Menu.Item>
								<Menu.Item className="sidebarItem" position="right">
									{this.props.authenticated && (
										<Button
											color="red"
											compact
											content="Sign In"
											onClick={() => this.props.history.push("/signin")}
										/>
									)}
									<Icon
										name="sidebar"
										onClick={() =>
											this.setState({
												visible: !visible
											})
										}
										size="large"
									/>
								</Menu.Item>
							</Responsive>
							<Responsive className="responsive" minWidth={1025}>
								<Menu.Item className="headerMenuItem">
									<ReactSVG
										className="headerLogo"
										evalScripts="always"
										onClick={() => {
											this.props.history.push("/activity")
										}}
										src={Logo}
										svgClassName="svgHeaderLogo"
									/>
									<NavSearch history={this.props.history} />
								</Menu.Item>
								<Menu.Item className="fallaciesLink">
									<Link to="/assign">
										<Icon color="green" name="plus" /> Assign
									</Link>
								</Menu.Item>
								<Menu.Item className="fallaciesLink">
									<Link to="/fallacies">
										<Icon color="blue" name="book" /> Reference
									</Link>
								</Menu.Item>
								{LoginButton(this.props)}
							</Responsive>
						</Container>
					</Menu>

					{SubHeader}

					<LoadingBar className="loadingBar" />

					<Sidebar
						as={Menu}
						animation="overlay"
						icon="labeled"
						vertical
						visible={visible}
						width="wide"
					>
						<Menu.Item>
							<Button
								color="blue"
								content="Assign a fallacy"
								fluid
								icon="pencil"
								onClick={() => this.props.history.push("/assign")}
							/>
						</Menu.Item>
						{FallaciesSidebar}
						{this.props.authenticated && (
							<Menu.Item onClick={this.onLogout}>Sign Out</Menu.Item>
						)}
					</Sidebar>
				</div>
			</Provider>
		)
	}
}

Header.defaultProps = {
	authenticated: false,
	logout
}

Header.propTypes = {
	authenticated: PropTypes.bool,
	logout: PropTypes.func
}

const mapStateToProps = (state, ownProps) => ({
	...state.user,
	...ownProps
})

export default connect(mapStateToProps, { logout })(Header)
