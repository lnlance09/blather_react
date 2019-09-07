import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Container, Divider, Dropdown, Header, Segment } from "semantic-ui-react"
import fallacies from "fallacies.json"
import FallaciesList from "components/fallaciesList/v1/"
import fallacyOptions from "fallacyOptions.json"
import FallacyRef from "components/fallacyRef/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class Fallacies extends Component {
	constructor(props) {
		super(props)

		const name = this.props.match.params.id
		const option = fallacyOptions.filter(f => f.key === name)
		const activeItem = option.length === 1 ? option[0].value : null

		this.state = {
			activeItem,
			intervalId: 0,
			selected: activeItem !== null
		}

		this.onChangeFallacy = this.onChangeFallacy.bind(this)
	}

	componentWillMount() {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	componentWillReceiveProps(props) {
		const name = props.match.params.id
		const option = fallacyOptions.filter(f => f.key === name)
		const activeItem = option.length === 1 ? option[0].value : null
		this.setState({ activeItem })
	}

	onChangeFallacy = (e, { value }) => {
		this.setState({
			activeItem: value,
			selected: value !== ""
		})
	}

	onClickFallacy = id => {
		window.scrollTo({ top: 0, behavior: "smooth" })
		this.setState({
			activeItem: id,
			selected: true
		})
	}

	scrollStep() {
		if (this.props.match.path === "/fallacies/:id") {
			if (window.pageYOffset === 0) {
				clearInterval(this.state.intervalId)
			}
			window.scroll(0, window.pageYOffset - 50)
		}
	}

	scrollToTop() {
		let intervalId = setInterval(this.scrollStep.bind(this), "16.66")
		this.setState({ intervalId })
	}

	render() {
		const { activeItem, selected } = this.state

		const RenderFallacies = fallacies.map((fallacy, i) => (
			<FallacyRef
				canScreenshot={false}
				className="fallacyRef"
				click={true}
				id={parseInt(fallacy.id, 10)}
				key={fallacy.key}
				onClick={this.onClickFallacy}
				showDialogue={false}
				showImage={true}
			/>
		))

		return (
			<Provider store={store}>
				<div className="fallaciesPage">
					<DisplayMetaTags page="fallacies" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container
						className="mainContainer"
						ref={this.handleContextRef}
						textAlign="left"
					>
						<Header as="h1">Reference</Header>
						<Segment>
							<Dropdown
								clearable
								fluid
								onChange={this.onChangeFallacy}
								options={fallacyOptions}
								placeholder="Search fallacies"
								selection
								size="large"
								value={activeItem}
							/>
							<Divider />

							{selected ? (
								<div>
									<FallacyRef
										canScreenshot={false}
										className="fallacyRef"
										id={parseInt(activeItem, 10)}
										showImage={true}
									/>

									<Header as="h2">Examples</Header>
									<FallaciesList
										emptyMsgContent="There are no records of this fallacy"
										fallacyId={activeItem}
										history={this.props.history}
										icon="warning sign"
										source="fallacy"
									/>
								</div>
							) : (
								<Segment.Group>{RenderFallacies}</Segment.Group>
							)}
						</Segment>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Fallacies.propTypes = {
	fallacies: PropTypes.object
}

export default Fallacies
