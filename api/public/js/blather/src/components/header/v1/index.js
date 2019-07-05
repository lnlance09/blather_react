import "./style.css"
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
	Input,
	Menu,
	Responsive,
	Sidebar
} from "semantic-ui-react"
import fallacies from "fallacies.json"
import LoadingBar from "react-redux-loading-bar"
import Logo from "./images/logo.svg"
import NavSearch from "components/search/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactSVG from "react-svg"
import store from "store"

class Header extends Component {
	constructor(props) {
		super(props)
		this.state = {
			activeItem: "",
			value: "",
			visible: false
		}
		this.onLogout = this.onLogout.bind(this)
	}

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name, visible: false })
		this.props.history.push(`/fallacies/${name.split(" ").join("-")}`)
	}

	onChangeSearch = (e, { value }) => {
		this.setState({ value })
	}

	onLogout() {
		this.props.logout()
		this.setState({ authenticated: false })
		this.props.history.push("/")
	}

	render() {
		const { activeItem, value, visible } = this.state
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
		const LoginButton = props => {
			if (props.authenticated) {
				const trigger = <Button color="blue">{props.data.name}</Button>
				return (
					<Menu.Item direction="right" position="right">
						<Dropdown className="dropDownMenu" fluid icon={false} trigger={trigger}>
							<Dropdown.Menu>
								<Dropdown.Item
									icon="user"
									onClick={() =>
										props.history.push(`/users/${props.data.username}`)
									}
									text="Profile"
								/>
								<Dropdown.Item
									icon="settings"
									onClick={() => props.history.push(`/settings`)}
									text="Settings"
								/>
								<Dropdown.Item
									icon="sign out"
									onClick={this.onLogout}
									text="Log out"
								/>
							</Dropdown.Menu>
						</Dropdown>
					</Menu.Item>
				)
			} else {
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
											this.props.history.push("/")
										}}
										src={Logo}
										svgClassName="svgHeaderLogo"
									/>
								</Menu.Item>
								<Menu.Item className="sidebarItem" position="right">
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
											this.props.history.push("/")
										}}
										src={Logo}
										svgClassName="svgHeaderLogo"
									/>
									<NavSearch history={this.props.history} />
								</Menu.Item>
								<Menu.Item className="fallaciesLink">
									<Link to="/activity">Activity</Link>
								</Menu.Item>
								<Menu.Item className="fallaciesLink">
									<Link to="/fallacies">Reference</Link>
								</Menu.Item>
								{LoginButton(this.props)}
							</Responsive>
						</Container>
					</Menu>
					<LoadingBar className="loadingBar" />
					<Sidebar
						as={Menu}
						animation="overlay"
						icon="labeled"
						vertical
						visible={visible}
						width="wide"
					>
						<Menu.Item as="div" name="search">
							<Input
								className="sidebarSearch"
								onChange={this.onChangeSearch}
								placeholder="Search..."
								size="large"
								value={value}
							/>
							<Button
								className="sidebarSearchBtn"
								color="green"
								content="Search"
								fluid
								icon="search"
								onClick={() => {
									this.setState({ visible: false })
									this.props.history.push(`/search?q=${value}`)
								}}
							/>
						</Menu.Item>
						{!this.props.authenticated ? (
							<Menu.Item>
								<Button.Group fluid>
									<Button
										color="blue"
										content="Sign In"
										onClick={() =>
											this.props.history.push("/signin?type=signin")
										}
										primary
									/>
									<Button.Or />
									<Button
										color="green"
										content="Join"
										onClick={() => this.props.history.push("/signin?type=join")}
										secondary
									/>
								</Button.Group>
							</Menu.Item>
						) : (
							<Menu.Item onClick={this.onLogout}>Sign Out</Menu.Item>
						)}
						<Menu.Item
							name="activity"
							onClick={() => {
								this.props.history.push(`/activity`)
							}}
						>
							Activity
						</Menu.Item>
						{FallaciesSidebar}
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

export default connect(
	mapStateToProps,
	{ logout }
)(Header)
