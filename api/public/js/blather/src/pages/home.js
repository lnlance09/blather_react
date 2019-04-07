import "pages/css/index.css"
import {
    parseInput
} from "./actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
    Button,
    Container,
    Form,
    Header,
    Icon,
    Image,
    Input,
    List,
    Menu,
    Segment,
} from "semantic-ui-react"
import Logo from "components/header/v1/images/logo.svg"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactSVG from "react-svg"
import store from "store"

class Home extends Component {
    constructor(props) {
        super(props)
        const currentState = store.getState()
        const authenticated = currentState.user.authenticated
        const bearer = currentState.user.bearer
        const userId = parseInt(currentState.user.data.id, 10)
        this.state = {
            authenticated,
            bearer,
            highlightedText: "",
            userId
        }

        this.onPaste = this.onPaste.bind(this)
    }

    onPaste = e => {
        const value = e.clipboardData.getData("Text")
        this.setState({ url: value })
        this.props.parseInput({
            bearer: this.state.bearer,
            type: this.props.type,
            url: value
        })
    }

    render() {
        const { authenticated, bearer, highlightedText } = this.state
        const { id, network, type, user } = this.props

        return (
            <Provider store={store}>
                <div className="tagsPage">
                    <DisplayMetaTags page="home" props={this.props} state={this.state} />
                    <PageHeader {...this.props} />
                    {!this.props.error ? (
                        <Container className="mainContainer" textAlign="left">
                            <Segment basic className="logoContainer" textAlign="center">
                                <Header className="aboutHeader" size="huge" textAlign="center">
                                    <ReactSVG
                                        className="blatherLogo"
                                        evalScripts="always"
                                        src={Logo}
                                        svgClassName="blatherLogoSvg"
                                    />
                                    Blather
                                    <Header.Subheader>
                                        It's not what you think. It's how you think.
                                    </Header.Subheader>
                                </Header>
                            </Segment>
                            <Input
                                fluid
                                focus
                                onPaste={this.onPaste}
                                placeholder="Link to YouTube video, comment or Tweet"
                                size="big"
                            />
                        </Container>
                    ) : (
                        <Container className="mainContainer" text textAlign="center">
                            <Header size="medium">This tag does not exist!</Header>
                        </Container>
                    )}
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

Home.propTypes = {
    error: PropTypes.bool
}

Home.defaultProps = {

}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.home,
        ...ownProps
    }
}

export default connect(
    mapStateToProps,
    {

    }
)(Home)
