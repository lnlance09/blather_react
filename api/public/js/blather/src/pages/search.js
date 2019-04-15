import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Accordion, Container, Form, Grid, Icon, Input, Menu, Responsive } from "semantic-ui-react"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import qs from "query-string"
import rawFallacies from "fallacies.json"
import React, { Component } from "react"
import SearchResults from "components/searchResults/v1/"
import store from "store"

class SearchPage extends Component {
	constructor(props) {
		super(props)
		const query = qs.parse(this.props.location.search)
		const type = this.props.match.params.type
		const currentState = store.getState()
		const bearer = currentState.user.bearer
		const auth = currentState.user.authenticated
		const types = ["fallacies", "twitter", "users", "youtube"]

		this.state = {
			activeIndex: 0,
			activeItem: types.indexOf(type) === -1 ? "twitter" : type,
			auth,
			bearer,
			fallacies: query.fallacies ? query.fallacies.split(",") : [],
			types,
			user: currentState.user.data,
			value: query.q ? query.q.trim() : ""
		}

		this.onChangeSearchValue = this.onChangeSearchValue.bind(this)
	}

	componentWillReceiveProps(props) {
		const query = qs.parse(props.location.search)
		this.setState({ value: query.q ? query.q.trim() : "" })
	}

	handleClick = (e, titleProps) => {
		const { index } = titleProps
		const { activeIndex } = this.state
		const newIndex = activeIndex === index ? 0 : index
		this.setState({ activeIndex: newIndex, activeItem: "fallacies" })
	}

	handleItemClick = (e, { name }) => {
		this.setState({
			activeItem: name,
			page: 0
		})

		const value =
			this.state.value === undefined || this.state.value === null ? "" : this.state.value
		this.props.history.push(`/search/${name}?q=${value}`)
	}

	handleRadioClick = (e, { value }) => {
		let fallacies = [...this.state.fallacies]
		const index = this.state.fallacies.indexOf(value)
		if (index === -1) {
			fallacies = [...this.state.fallacies, value]
		} else {
			fallacies = this.state.fallacies.filter(i => i !== value)
		}

		this.setState({
			activeItem: "fallacies",
			fallacies,
			page: 0
		})

		const fallaciesString = fallacies.join(",")
		const val =
			this.state.value === undefined || this.state.value === null ? "" : this.state.value
		this.props.history.push(`/search/fallacies?q=${val}&fallacies=${fallaciesString}`)
	}

	onChangeSearchValue = (e, { value }) => {
		this.setState({
			page: 0,
			value
		})

		if (value !== undefined) {
			const item = this.state.activeItem
			let fallaciesString = ""
			if (item === "fallacies") {
				fallaciesString =
					this.state.fallacies.length > 0
						? `&fallacies=${this.state.fallacies.join(",")}`
						: ""
			}
			this.props.history.push(`/search/${item}?q=${value}${fallaciesString}`)
		}
	}

	render() {
		const { activeIndex, activeItem, auth, bearer, fallacies, page, value, user } = this.state

		const FallacyItem = rawFallacies.map((item, i) => (
			<Form.Checkbox
				checked={fallacies.indexOf(item.id.toString()) !== -1}
				key={`fallacy_${i}`}
				label={item.name}
				name="fallacies"
				onChange={this.handleRadioClick}
				value={item.id}
			/>
		))

		const FallacyForm = (
			<Form>
				<Form.Group grouped>{FallacyItem}</Form.Group>
			</Form>
		)

		const SearchMenu = props => (
			<Accordion as={Menu} className="searchMenu" borderless fluid vertical>
				<Menu.Item className="searchItem">
					<Input
						icon="search"
						onChange={this.onChangeSearchValue}
						placeholder="Search..."
						value={value}
					/>
				</Menu.Item>
				<Menu.Item
					active={activeItem === "twitter"}
					name="twitter"
					onClick={this.handleItemClick}
				>
					Profiles
					<Icon
						className="twitterIcon"
						inverted={activeItem === "twitter"}
						name="twitter"
					/>
				</Menu.Item>
				<Menu.Item
					active={activeItem === "youtube"}
					name="youtube"
					onClick={this.handleItemClick}
				>
					Channels
					<Icon
						className="youtubeIcon"
						inverted={activeItem === "youtube"}
						name="youtube"
					/>
				</Menu.Item>
				<Menu.Item
					active={activeItem === "users"}
					name="users"
					onClick={this.handleItemClick}
				>
					Users
					<Icon
						className="usersIcon"
						inverted={activeItem === "users"}
						name="user circle"
					/>
				</Menu.Item>
				<Menu.Item>
					<Accordion.Title
						active={activeIndex === 0}
						content="Fallacies"
						index={0}
						name="fallacies"
						onClick={this.handleClick}
					/>
					{activeItem === "fallacies" && (
						<Accordion.Content active={activeIndex === 0} content={FallacyForm} />
					)}
				</Menu.Item>
			</Accordion>
		)

		return (
			<Provider store={store}>
				<div className="searchPage">
					<DisplayMetaTags page="search" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						<Responsive maxWidth={900}>
							<Grid>
								<Grid.Row>{SearchMenu(this.props)}</Grid.Row>
								<Grid.Row>
									<SearchResults
										authenticated={auth}
										bearer={bearer}
										fallacies={fallacies.join(",")}
										history={this.props.history}
										linkedTwitter={auth ? user.linkedTwitter : false}
										linkedYoutube={auth ? user.linkedYoutube : false}
										page={page}
										q={value}
										type={activeItem}
									/>
								</Grid.Row>
							</Grid>
						</Responsive>

						<Responsive minWidth={901}>
							<Grid>
								<Grid.Column width={5}>{SearchMenu(this.props)}</Grid.Column>
								<Grid.Column className="rightSide" width={11}>
									<SearchResults
										authenticated={auth}
										bearer={bearer}
										fallacies={fallacies.join(",")}
										history={this.props.history}
										linkedTwitter={auth ? user.linkedTwitter : false}
										linkedYoutube={auth ? user.linkedYoutube : false}
										page={page}
										q={value}
										type={activeItem}
									/>
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

SearchPage.propTypes = {
	pageType: PropTypes.string
}

SearchPage.defaultProps = {
	pageType: "search"
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.search,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{}
)(SearchPage)
