import { DisplayMetaTags } from "utils/metaFunctions"
import { setValue } from "redux/actions/search"
import { connect, Provider } from "react-redux"
import { Accordion, Form, Grid, Menu, Responsive, Segment } from "semantic-ui-react"
import DefaultLayout from "layouts"
import PropTypes from "prop-types"
import qs from "query-string"
import rawFallacies from "options/fallacies.json"
import React, { Component } from "react"
import SearchResults from "components/secondary/searchResults/v1/"
import store from "store"

class SearchPage extends Component {
	constructor(props) {
		super(props)

		const query = qs.parse(this.props.location.search)
		const type = this.props.match.params.type
		const currentState = store.getState()
		const bearer = currentState.user.bearer
		const auth = currentState.user.authenticated
		const types = ["channels", "fallacies", "profiles", "tags", "tweets", "users", "videos"]
		const fallacies = query.fallacies ? query.fallacies.split(",") : []
		const activeItem = types.indexOf(type) === -1 ? "profiles" : type

		this.state = {
			activeItem,
			all: false,
			auth,
			bearer,
			fallacies,
			types,
			q: query.q,
			user: currentState.user.data
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps !== this.props) {
			const query = qs.parse(this.props.location.search)
			this.setState({ q: query.q })
		}
	}

	changeUrl = fallacies => {
		let radioVal = this.state.q
		let radioValue = radioVal === undefined || radioVal === null ? "" : radioVal
		let fallacyStr = fallacies.join(",")
		this.props.history.push(`/search/fallacies?q=${radioValue}&fallacies=${fallacyStr}`)
	}

	checkAll = () => {
		let fallacies = []
		const all = this.state.all
		if (!all) {
			for (let i = 0; i < rawFallacies.length; i++) {
				fallacies[i] = rawFallacies[i].id
			}
		}

		this.setState({
			activeItem: "fallacies",
			all: !all,
			fallacies
		})

		this.changeUrl(fallacies)
	}

	handleItemClick = (e, { name }) => {
		this.setState({
			activeItem: name
		})

		let itemVal = this.state.q
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
			fallacies
		})

		this.changeUrl(fallacies)
	}

	onChangeSearchValue = value => {
		this.setState({ q: value })
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
		const { activeItem, all, auth, bearer, fallacies, q, user } = this.state

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
			<Form inverted>
				<Form.Group grouped>
					<Form.Checkbox
						checked={all}
						key="all"
						label={`${this.state.all ? "Uncheck" : "Check"} All`}
						name="fallacies"
						onChange={this.checkAll}
						value="all"
					/>
					{FallacyItem}
				</Form.Group>
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
				q={q}
				type={activeItem}
			/>
		)

		const SearchMenu = props => (
			<Accordion
				as={Menu}
				borderless
				className="searchMenu"
				fluid
				inverted
				size="large"
				vertical
			>
				<Menu.Item
					active={activeItem === "profiles"}
					name="profiles"
					onClick={this.handleItemClick}
				>
					Twitter users
				</Menu.Item>
				<Menu.Item
					active={activeItem === "tweets"}
					name="tweets"
					onClick={this.handleItemClick}
				/>
				<Menu.Item
					active={activeItem === "users"}
					name="users"
					onClick={this.handleItemClick}
				>
					Users
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
					<DefaultLayout
						activeItem="search"
						containerClassName="searchPage"
						history={this.props.history}
					>
						<Responsive maxWidth={1024}>
							<Grid>
								<Grid.Row>{SearchMenu(this.props)}</Grid.Row>
								<Grid.Row>{SearchItems()}</Grid.Row>
							</Grid>
						</Responsive>

						<Responsive minWidth={1025}>
							<Grid>
								<Grid.Column className="rightSide" width={11}>
									{SearchItems()}
								</Grid.Column>
								<Grid.Column width={5}>
									<Segment className="searchSegment" inverted>
										{SearchMenu(this.props)}
									</Segment>
								</Grid.Column>
							</Grid>
						</Responsive>
					</DefaultLayout>
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

export default connect(mapStateToProps, {
	setValue
})(SearchPage)
