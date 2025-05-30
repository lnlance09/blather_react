import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider, connect } from "react-redux"
import { Container, Header } from "semantic-ui-react"
import DiscussionsList from "components/secondary/lists/discussionsList/v1/"
import PageFooter from "components/primary/footer/v1/"
import PageHeader from "components/secondary/header/v1/"
import React, { Component } from "react"
import store from "store"

class DiscussionsPage extends Component {
	constructor(props) {
		super(props)

		const currentState = store.getState()
		const { authenticated, bearer } = currentState.user

		this.state = {
			authenticated,
			bearer
		}
	}

	render() {
		const { bearer } = this.state
		return (
			<Provider store={store}>
				<div className="discussionsPage">
					<DisplayMetaTags page="discussions" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						<Header as="h1">
							Discussions
							<Header.Subheader>Honest and evidence based</Header.Subheader>
						</Header>
						<Container className="discussionsContainer">
							<DiscussionsList bearer={bearer} includeFilter {...this.props} />
						</Container>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.page,
		...ownProps
	}
}

export default connect(mapStateToProps, {})(DiscussionsPage)
