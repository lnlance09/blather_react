import "./style.css"
import { logout } from "components/authentication/v1/actions"
import { Provider, connect } from "react-redux"
import { Link } from "react-router-dom"
import { Button, Container, Dropdown, Icon, Menu, Responsive, Sidebar } from "semantic-ui-react"
import fallacies from "fallacies.json"
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
			visible: false
		}
		this.onLogout = this.onLogout.bind(this)
	}

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name, visible: false })
		this.props.history.push(`/fallacies/${name.split(" ").join("_")}`)
	}

	onLogout() {
		this.props.logout()
		this.setState({ authenticated: false })
		this.props.history.push("/")
	}

	render() {
		const { activeItem, visible } = this.state
		const fallaciesSidebar = fallacies.map(fallacy => (
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
				return (
					<Dropdown
						className="dropDownMenu right"
						icon={false}
						item
						text={props.data.name}
					>
						<Dropdown.Menu>
							<Dropdown.Item
								onClick={() => props.history.push(`/users/${props.data.username}`)}
							>
								Profile
							</Dropdown.Item>
							<Dropdown.Item onClick={() => props.history.push(`/settings`)}>
								Settings
							</Dropdown.Item>
							<Dropdown.Item onClick={this.onLogout}>Log out</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				)
			} else {
				return (
					<Menu.Item className="signInLink" direction="right" position="right">
						<Button
							color="green"
							compact
							content="Sign In"
							onClick={() => props.history.push("/signin")}
						/>
					</Menu.Item>
				)
			}
		}

		return (
			<Provider store={store}>
				<div className="pageHeader">
					<Menu
						borderless
						className="globalHeader"
						fitted="vertically"
						fixed="top"
						inverted
					>
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
									<Link to="/fallacies">Fallacies</Link>
								</Menu.Item>
								{LoginButton(this.props)}
							</Responsive>
						</Container>
					</Menu>
					<Sidebar
						as={Menu}
						animation="overlay"
						icon="labeled"
						inverted
						vertical
						visible={visible}
						width="wide"
					>
						{!this.props.authenticated ? (
							<Menu.Item onClick={() => this.props.history.push("/signin")}>
								<Button content="Sign In" fluid primary />
							</Menu.Item>
						) : (
							<Menu.Item onClick={this.onLogout}>Sign Out</Menu.Item>
						)}
						<Menu.Item name="fallacies">
							<b>Fallacies</b>
						</Menu.Item>
						{fallaciesSidebar}
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
