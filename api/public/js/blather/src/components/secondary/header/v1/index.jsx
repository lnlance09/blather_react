import "./style.css"
import { logout } from "components/secondary/authentication/v1/actions"
import { parseJwt } from "utils/tokenFunctions"
import { Provider, connect } from "react-redux"
import { Button, Container, Grid, Icon, Image, Menu, Sidebar } from "semantic-ui-react"
import Logo from "images/logos/brain-logo.svg"
import NavSearch from "components/primary/search/v1/"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import store from "store"

const Header = ({ history, q, showResults }) => {
	const [authenticated, setAuthenticated] = useState(null)
	const [sidebarVisible, setSidebarVisible] = useState(false)
	const [user, setUser] = useState({})

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setUser(userData)
			setAuthenticated(true)
		} else {
			setAuthenticated(false)
		}
	}, [])

	return (
		<Provider store={store}>
			<div className="pageHeader">
				<div className="topHeader">
					<Container className="desktop">
						<Grid stackable>
							<Grid.Column className="logoColumn" width={4}>
								<div>
									<Image
										className="headerLogo"
										onClick={() => history.push("/")}
										rounded
										src={Logo}
									/>
								</div>
								<div className="slogan" onClick={() => history.push("/")}>
									<div className="sloganTop">talking a lot</div>
									<div className="sloganBottom">saying nothing</div>
								</div>
							</Grid.Column>
							<Grid.Column className="inputColumn" width={12}>
								<NavSearch
									defaultValue={q}
									history={history}
									showResults={showResults}
									width="100%"
								/>
							</Grid.Column>
						</Grid>
					</Container>
					<Container className="mobile">
						<Menu borderless fitted="vertically" fixed="top" fluid inverted>
							<Container>
								<Menu.Item position="left">
									<Image
										className="headerLogo"
										onClick={() => history.push("/")}
										rounded
										src={Logo}
									/>
								</Menu.Item>
								<Menu.Item position="right">
									{authenticated === false && (
										<Button
											className="allyButton"
											color="blue"
											compact
											content="Sign In"
											inverted
											onClick={() => history.push("/signin")}
										/>
									)}
									<Icon
										color={sidebarVisible ? "blue" : null}
										inverted
										name="ellipsis horizontal"
										onClick={() => setSidebarVisible(!sidebarVisible)}
										size="big"
									/>
								</Menu.Item>
							</Container>
						</Menu>
					</Container>
				</div>

				<Sidebar
					as={Menu}
					animation="push"
					borderless
					direction="bottom"
					icon="labeled"
					inverted
					onHide={() => setSidebarVisible(false)}
					size="massive"
					style={{ textAlign: "left" }}
					vertical
					visible={sidebarVisible}
				>
					<Menu.Item as="a" onClick={() => history.push("/")}>
						<Icon name="home" size="small" />
						Home
					</Menu.Item>
					<Menu.Item as="a" onClick={() => history.push("/activity")}>
						<Icon name="chart line" size="small" />
						Activity
					</Menu.Item>
					<Menu.Item as="a" onClick={() => history.push("/assign")}>
						<Icon name="plus" size="small" />
						Assign
					</Menu.Item>
					<Menu.Item as="a" onClick={() => history.push("/grifters")}>
						<Icon name="user" size="small" />
						Grifters
					</Menu.Item>
					<Menu.Item as="a" onClick={() => history.push("/arguments")}>
						<Icon name="gavel" size="small" />
						Arguments
					</Menu.Item>
					<Menu.Item as="a" onClick={() => history.push("/fallacies")}>
						<Icon name="book" size="small" />
						Reference
					</Menu.Item>
					{authenticated && (
						<Menu.Item as="a" onClick={() => history.push(`/${user.username}`)}>
							<Icon name="user" size="small" />
							Profile
						</Menu.Item>
					)}
				</Sidebar>
			</div>
		</Provider>
	)
}

Header.propTypes = {
	logout: PropTypes.func,
	q: PropTypes.string,
	showResults: PropTypes.bool,
	toggleSearchMode: PropTypes.func
}

Header.defaultProps = {
	logout,
	q: "",
	showResults: true
}

const mapStateToProps = (state, ownProps) => ({
	...state.user,
	...ownProps
})

export default connect(mapStateToProps, { logout })(Header)
