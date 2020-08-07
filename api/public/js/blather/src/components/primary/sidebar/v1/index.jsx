import "./style.css"
import { logout } from "components/secondary/authentication/v1/actions"
import { Button, Divider, Icon, Menu } from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import store from "store"
import Url from "url-parse"

const Sidebar = ({ activeItem, basic, history, inverted, logout }) => {
	const [authenticated, setAuthenticated] = useState(null)
	const [user, setUser] = useState({})

	useEffect(() => {}, [])

	const { username } = user

	const onLogout = () => {
		this.props.logout()
		const parsed = new Url(window.location)
		if (parsed.pathname !== "/") {
			window.location.reload()
		}
	}

	const LoginButton = () => {
		if (authenticated) {
			return (
				<Fragment>
					<Divider inverted={inverted} />
					<Menu.Item
						active={activeItem === "profile"}
						className="headerMenuItem profile"
						onClick={() => history.push(`/${username}`)}
					>
						Profile
					</Menu.Item>
					<Menu.Item
						className="headerMenuItem signout"
						onClick={() => {
							logout()
						}}
					>
						Sign out
					</Menu.Item>
				</Fragment>
			)
		}

		return (
			<Fragment>
				<Menu.Item className="headerMenuItem signIn">
					<Button
						color="blue"
						content="Sign Up"
						fluid
						inverted={inverted}
						onClick={() => history.push("/signin?type=join")}
						size="big"
					/>
				</Menu.Item>
				<Divider horizontal inverted={inverted}>
					Or
				</Divider>
				<Menu.Item className="headerMenuItem signIn">
					<Button
						color="yellow"
						content="Sign In"
						fluid
						inverted={inverted}
						onClick={() => history.push("/signin")}
						size="big"
					/>
				</Menu.Item>
			</Fragment>
		)
	}

	return (
		<Provider store={store}>
			<div className="pageSidebar">
				<Menu
					borderless
					className="globalSidebar"
					fluid
					inverted={inverted}
					size="massive"
					vertical
				>
					{!basic && (
						<Fragment>
							<Menu.Item
								active={activeItem === "home"}
								className="headerMenuItem home"
								onClick={() => history.push("/home")}
							>
								<Icon
									color={activeItem === "home" ? "yellow" : null}
									inverted={inverted}
									name="home"
								/>
								Home
							</Menu.Item>
							<Menu.Item
								active={activeItem === "addInteraction"}
								className="headerMenuItem addInteraction"
								onClick={() => history.push("/assign")}
							>
								<Icon
									color={activeItem === "addInteraction" ? "yellow" : null}
									inverted={inverted}
									name="plus"
								/>
								Assign
							</Menu.Item>
							<Menu.Item
								active={activeItem === "grifters"}
								className="headerMenuItem grifters"
								onClick={() => history.push("/grifters")}
							>
								<Icon
									color={activeItem === "interactions" ? "yellow" : null}
									inverted={inverted}
									name="user circle"
								/>
								Grifters
							</Menu.Item>
							<Menu.Item
								active={activeItem === "reference"}
								className="headerMenuItem reference"
								onClick={() => history.push("/fallacies")}
							>
								<Icon
									color={activeItem === "reference" ? "yellow" : null}
									inverted={inverted}
									name="book"
								/>
								Reference
							</Menu.Item>
							<Menu.Item
								active={activeItem === "tags"}
								className="headerMenuItem tags"
								onClick={() => history.push("/tags")}
							>
								<Icon
									color={activeItem === "tags" ? "yellow" : null}
									inverted={inverted}
									name="tag"
								/>
								Tags
							</Menu.Item>
							<Menu.Item
								active={activeItem === "notifications"}
								className="headerMenuItem notifications"
								onClick={() => history.push("/notifications")}
							>
								<Icon
									color={activeItem === "notifications" ? "yellow" : null}
									inverted={inverted}
									name="bell"
								/>
								Notifications
							</Menu.Item>
							{LoginButton()}
						</Fragment>
					)}
				</Menu>
			</div>
		</Provider>
	)
}

Sidebar.propTypes = {
	activeItem: PropTypes.string,
	basic: PropTypes.bool,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	logout: PropTypes.func
}

Sidebar.defaultProps = {
	activeItem: "",
	basic: false,
	loading: false,
	logout
}

const mapStateToProps = (state, ownProps) => ({
	...state.authentication,
	...ownProps
})

export default connect(mapStateToProps, { logout })(Sidebar)
