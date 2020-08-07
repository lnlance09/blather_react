import "./style.css"
import { logout } from "components/secondary/authentication/v1/actions"
import { Provider, connect } from "react-redux"
import { Container, Grid, Menu, Responsive } from "semantic-ui-react"
import LoadingBar from "react-redux-loading-bar"
import Logo from "./images/logo.svg"
import NavSearch from "components/primary/search/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactSVG from "react-svg"
import store from "store"

class Header extends Component {
	constructor(props) {
		super(props)

		this.state = {
			activeItem: ""
		}
	}

	render() {
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

		return (
			<Provider store={store}>
				<div className="pageHeader">
					<div className="topHeader">
						<Container className="headerContainer">
							<Grid stackable>
								<Grid.Row>
									<Grid.Column className="logoColumn" width={4}>
										<ReactSVG
											className="headerLogo"
											evalScripts="always"
											onClick={() => {
												this.props.history.push("/activity")
											}}
											src={Logo}
											svgClassName="svgHeaderLogo"
										/>
									</Grid.Column>
									<Grid.Column className="inputColumn" width={12}>
										<NavSearch history={this.props.history} width="100%" />
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Container>
					</div>

					{SubHeader}
				</div>
			</Provider>

			/*
	return (
		<div className="pageHeader">
			<div className="rainbow" />
			{loading && (
				<Fragment>
					<div className="subline inc" />
					<div className="subline dec" />
				</Fragment>
			)}

			<div className="topHeader">
				<Container className={`desktop ${basicHeader ? "basic" : ""}`}>
					{basicHeader ? (
						<Image
							className="logo"
							onClick={() => router.push("/")}
							rounded
							src={Logo}
						/>
					) : (
						<Grid stackable>
							<Grid.Column className="logoColumn" width={4}>
								<Image
									className="logo"
									onClick={() => router.push("/")}
									rounded
									src={Logo}
								/>
							</Grid.Column>
							<Grid.Column className="inputColumn" width={12}>
								<Autocomplete category />
							</Grid.Column>
						</Grid>
					)}
				</Container>
				<Container className={`mobile ${basicHeader ? "basic" : ""}`}>
					{basicHeader ? (
						<Image
							className="logo"
							onClick={() => router.push("/")}
							rounded
							src={Logo}
						/>
					) : (
						<Menu borderless fitted="vertically" fixed="top" fluid inverted>
							<Container>
								<Menu.Item position="left">
									<Image
										className="logo"
										onClick={() => router.push("/")}
										rounded
										src={Logo}
									/>
								</Menu.Item>
								<Menu.Item position="right">
									{authenticated === false && (
										<Button
											className="allyButton"
											color="yellow"
											compact
											content="Become an ally"
											inverted
											onClick={() => router.push("/signin?type=join")}
										/>
									)}
									<Icon
										color={sidebarVisible ? "yellow" : null}
										inverted
										name="ellipsis horizontal"
										onClick={() => setSidebarVisible(!sidebarVisible)}
										size="big"
									/>
								</Menu.Item>
							</Container>
						</Menu>
					)}
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
				<Menu.Item as="a" onClick={() => router.push("/")}>
					<Icon name="home" size="small" />
					Home
				</Menu.Item>
				<Menu.Item as="a" onClick={() => toggleSearchMode()}>
					<Icon name="search" size="small" />
					Search
				</Menu.Item>
				{authenticated && (
					<Menu.Item as="a" onClick={() => router.push(`/${user.username}`)}>
						<Icon name="user" size="small" />
						Profile
					</Menu.Item>
				)}
				<Menu.Item as="a" onClick={() => router.push("/interactions/create")}>
					<Icon name="plus" size="small" />
					Add an interaction
				</Menu.Item>
			</Sidebar>
		</div>
		*/
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
