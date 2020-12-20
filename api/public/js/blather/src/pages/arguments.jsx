import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Container, Header } from "semantic-ui-react"
import Arguments from "components/primary/arguments/v1/"
import DefaultLayout from "layouts"
import React, { Component } from "react"
import store from "store"

class ArgumentsPage extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<Provider store={store}>
                <div className="aboutPage">
					<DisplayMetaTags page="arguments" props={this.props} state={this.state} />

					<DefaultLayout
						activeItem="arguments"
						containerClassName="argumentsPage"
						history={this.props.history}
					>
                        <Container>
                            <Header inverted size="huge">
                                Arguments (sort of)
                            </Header>
                            <Arguments />
                        </Container>
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

export default ArgumentsPage
