import "./style.css"
import { parseJwt } from "utils/tokenFunctions"
import { logout } from "components/secondary/authentication/v1/actions"
import { Button, Divider, Icon, Image, Label, Menu } from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import defaultImg from "images/avatar/small/steve.jpg"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import store from "store"

const Sidebar = ({ activeItem, basic, history, inverted, logout }) => {
	const [authenticated, setAuthenticated] = useState(null)
	const [user, setUser] = useState({})

	useEffect(() => {
		let userData = parseJwt()
		if (userData === false) {
			setAuthenticated(false)
		} else {
			setAuthenticated(true)
			setUser(userData)
		}
	}, [])

	const { username } = user

	const onLogout = () => {
		logout()
		window.location.reload()
	}

	const LoginButton = () => {
		if (authenticated) {
			return (
				<Fragment>
					<Menu.Item
						active={activeItem === "profile"}
						className="headerMenuItem profile"
						onClick={() => history.push(`/users/${username}`)}
					>
						<Image
							avatar
							className="userItemImg"
							onError={i => (i.target.src = defaultImg)}
							src={user.img === null ? defaultImg : user.img}
						/>
						Profile
					</Menu.Item>
					<Menu.Item className="headerMenuItem signout" onClick={onLogout}>
						Sign out
					</Menu.Item>
				</Fragment>
			)
		}

		return (
			<Fragment>
				<Menu.Item className="headerMenuItem signIn">
					<Button
						active
						color="blue"
						content="Sign In"
						fluid
						inverted={inverted}
						onClick={() => history.push("/signin")}
						size="large"
					/>
				</Menu.Item>
				<Divider horizontal inverted={inverted}>
					Or
				</Divider>
				<Menu.Item className="headerMenuItem signIn">
					<Button
						active
						color="red"
						content="Take Action"
						fluid
						inverted={inverted}
						onClick={() => history.push("/signin?type=join")}
						size="large"
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
									color={activeItem === "home" ? "blue" : null}
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
									color={activeItem === "addInteraction" ? "blue" : null}
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
									color={activeItem === "grifters" ? "blue" : null}
									inverted={inverted}
									name="user"
								/>
								Grifters
							</Menu.Item>
							<Menu.Item
								active={activeItem === "arguments"}
								className="headerMenuItem arguments"
								onClick={() => history.push("/arguments")}
							>
								<Icon
									color={activeItem === "arguments" ? "blue" : null}
									inverted={inverted}
									name="gavel"
								/>
								<Label color="green">New</Label>
								Arguments
							</Menu.Item>
							<Menu.Item
								active={activeItem === "tags"}
								className="headerMenuItem tags"
								onClick={() => history.push("/tags")}
							>
								<Icon
									color={activeItem === "tags" ? "blue" : null}
									inverted={inverted}
									name="tag"
								/>
								Tags
							</Menu.Item>
							<Menu.Item
								active={activeItem === "reference"}
								className="headerMenuItem reference"
								onClick={() => history.push("/fallacies")}
							>
								<Icon
									color={activeItem === "reference" ? "blue" : null}
									inverted={inverted}
									name="book"
								/>
								Reference
							</Menu.Item>
							<Menu.Item
								active={activeItem === "search"}
								className="headerMenuItem search"
								onClick={() => history.push("/search")}
							>
								<Icon
									color={activeItem === "search" ? "blue" : null}
									inverted={inverted}
									name="search"
								/>
								Search
							</Menu.Item>
							<Menu.Item
								active={activeItem === "about"}
								className="headerMenuItem about"
								onClick={() => history.push("/about")}
							>
								<Icon
									color={activeItem === "about" ? "blue" : null}
									inverted={inverted}
									name="info circle"
								/>
								About
							</Menu.Item>
							{/*
							<Menu.Item
								active={activeItem === "notifications"}
								className="headerMenuItem notifications"
								onClick={() => history.push("/notifications")}
							>
								<Icon
									color={activeItem === "notifications" ? "blue" : null}
									inverted={inverted}
									name="bell"
								/>
								Notifications
							</Menu.Item>
							*/}
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
