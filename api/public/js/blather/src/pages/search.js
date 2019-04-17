import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { setValue } from "pages/actions/search"
import { connect, Provider } from "react-redux"
import { DebounceInput } from "react-debounce-input"
import { Accordion, Container, Form, Grid, Icon, Menu, Responsive } from "semantic-ui-react"
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
		const types = ["channels", "fallacies", "profiles", "tweets", "users", "videos"]
		const fallacies = query.fallacies ? query.fallacies.split(",") : []
		const activeItem = types.indexOf(type) === -1 ? "profiles" : type

		this.state = {
			activeItem,
			auth,
			bearer,
			fallacies,
			types,
			user: currentState.user.data
		}

		this.props.setValue({ value: query.q })
	}

	handleItemClick = (e, { name }) => {
		this.setState({
			activeItem: name,
			page: 0
		})

		let itemVal = this.props.q
		let value = itemVal === undefined || itemVal === null ? "" : itemVal
		this.props.history.push(`/search/${name}?q=${value}`)
	}

	handleRadioClick = (e, { value }) => {
		const index = this.state.fallacies.indexOf(value)
		let fallacies = [...this.state.fallacies]
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

		let radioVal = this.props.q
		let radioValue = radioVal === undefined || radioVal === null ? "" : radioVal
		let fallacyStr = fallacies.join(",")
		this.props.history.push(`/search/fallacies?q=${radioValue}&fallacies=${fallacyStr}`)
	}

	onChangeSearchValue = value => {
		this.setState({ page: 0 })
		this.props.setValue({ value })

		if (value !== undefined) {
			let { activeItem, fallacies } = this.state
			let fallacyStr = ""
			if (activeItem === "fallacies") {
				fallacyStr = fallacies.length > 0 ? `&fallacies=${fallacies.join(",")}` : ""
			}
			this.props.history.push(`/search/${activeItem}?q=${value}${fallacyStr}`)
		}
	}

	render() {
		const { activeItem, auth, bearer, fallacies, page, user } = this.state
		const { q } = this.props

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

		const SearchItems = () => (
			<SearchResults
				authenticated={auth}
				bearer={bearer}
				fallacies={fallacies.join(",")}
				history={this.props.history}
				linkedTwitter={auth ? user.linkedTwitter : false}
				linkedYoutube={auth ? user.linkedYoutube : false}
				page={page}
				q={q}
				type={activeItem}
			/>
		)

		const SearchMenu = props => (
			<Accordion as={Menu} borderless className="searchMenu" fluid vertical>
				<Menu.Item className="searchItem">
					<div className="ui icon input">
						<DebounceInput
							debounceTimeout={300}
							minLength={2}
							onChange={e => this.onChangeSearchValue(e.target.value)}
							placeholder="Search..."
							value={q}
						/>
						<i aria-hidden="true" className="search icon" />
					</div>
				</Menu.Item>
				<Menu.Item>
					Twitter
					<Icon className="twitterIcon" name="twitter" />
					<Menu.Menu>
						<Menu.Item
							active={activeItem === "profiles"}
							name="profiles"
							onClick={this.handleItemClick}
						/>
						<Menu.Item
							active={activeItem === "tweets"}
							name="tweets"
							onClick={this.handleItemClick}
						/>
					</Menu.Menu>
				</Menu.Item>
				<Menu.Item>
					YouTube
					<Icon className="youtubeIcon" name="youtube" />
					<Menu.Menu>
						<Menu.Item
							active={activeItem === "channels"}
							name="channels"
							onClick={this.handleItemClick}
						/>
						<Menu.Item
							active={activeItem === "videos"}
							name="videos"
							onClick={this.handleItemClick}
						/>
					</Menu.Menu>
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
					<Accordion.Title active content="Fallacies" index={0} name="fallacies" />
					<Accordion.Content active content={FallacyForm} />
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
								<Grid.Row>{SearchItems()}</Grid.Row>
							</Grid>
						</Responsive>

						<Responsive minWidth={901}>
							<Grid>
								<Grid.Column width={5}>{SearchMenu(this.props)}</Grid.Column>
								<Grid.Column className="rightSide" width={11}>
									{SearchItems()}
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
	pageType: PropTypes.string,
	q: PropTypes.string,
	setValue: PropTypes.func
}

SearchPage.defaultProps = {
	pageType: "search",
	q: "",
	setValue
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.search,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		setValue
	}
)(SearchPage)
