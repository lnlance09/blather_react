import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Container, Divider, Dropdown, Form, Header, Segment } from "semantic-ui-react"
import DefaultLayout from "layouts"
import fallacies from "options/fallacies.json"
import FallaciesList from "components/secondary/lists/fallaciesList/v1/"
import fallacyOptions from "options/fallacyOptions.json"
import FallacyRef from "components/primary/fallacyRef/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class Fallacies extends Component {
	constructor(props) {
		super(props)

		const name = this.props.match.params.id
		const option = fallacyOptions.filter(f => f.key === name)
		const activeItem = option.length === 1 ? option[0].value : null
		const activeItemName = option.length === 1 ? option[0].text : null

		this.state = {
			activeItem,
			activeItemName,
			selected: activeItem !== null
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps !== this.props) {
			const name = this.props.match.params.id
			const option = fallacyOptions.filter(f => f.key === name)
			const activeItem = option.length === 1 ? option[0].value : null
			const activeItemName = option.length === 1 ? option[0].text : null
			this.setState({
				activeItem,
				activeItemName,
				selected: activeItem !== null
			})
		}
	}

	onChangeFallacy = (e, { value }) => {
		let activeItemName = ""
		if (value !== "") {
			const option = fallacyOptions.filter(f => f.value === value)
			activeItemName = option.length === 1 ? option[0].text : null
			const slug = option.length === 1 ? option[0].key : null
			this.props.history.push(`/fallacies/${slug}`)
		} else {
			this.props.history.push("/fallacies")
		}

		this.setState({
			activeItem: value,
			activeItemName,
			selected: value !== ""
		})
	}

	onClickFallacy = id => {
		const option = fallacyOptions.filter(f => f.value === id)
		const activeItemName = option.length === 1 ? option[0].text : null
		const slug = option.length === 1 ? option[0].key : null

		this.props.history.push(`/fallacies/${slug}`)
		this.setState({
			activeItem: id,
			activeItemName,
			selected: true
		})
	}

	render() {
		const { activeItem, activeItemName, selected } = this.state

		const RenderFallacies = fallacies.map((fallacy, i) => (
			<FallacyRef
				canScreenshot={false}
				className="fallacyRef"
				click={true}
				id={parseInt(fallacy.id, 10)}
				key={fallacy.key}
				onClick={this.onClickFallacy}
				showDialogue={false}
				size="medium"
			/>
		))

		return (
			<Provider store={store}>
				<div className="fallaciesPage">
					<DisplayMetaTags page="fallacies" props={this.props} state={this.state} />

					<DefaultLayout
						activeItem="reference"
						containerClassName="fallaciesPage"
						history={this.props.history}
					>
						<Container ref={this.handleContextRef}>
							<Header as="h1" inverted>
								{activeItem ? activeItemName : "Reference"}
							</Header>
							<Segment inverted>
								<Form size="big">
									<Dropdown
										clearable
										fluid
										inverted
										onChange={this.onChangeFallacy}
										options={fallacyOptions}
										placeholder="Select a fallacy"
										search
										selection
										value={activeItem}
									/>
								</Form>
								<Divider inverted />

								{selected ? (
									<div>
										<FallacyRef
											canScreenshot={false}
											className="fallacyRef"
											id={parseInt(activeItem, 10)}
											size="medium"
										/>

										<Header as="h2" inverted>
											Examples
										</Header>
										<FallaciesList
											emptyMsgContent="There are no records of this fallacy"
											fallacyId={activeItem}
											history={this.props.history}
											icon="warning sign"
											itemsPerRow={2}
											source="fallacy"
										/>
									</div>
								) : (
									<Segment.Group>{RenderFallacies}</Segment.Group>
								)}
							</Segment>
						</Container>
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

Fallacies.propTypes = {
	fallacies: PropTypes.object
}

export default Fallacies
