import './css/index.css';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { sendContactMsg } from './actions/about';
import { connect, Provider } from 'react-redux';
import { 
    Button,
    Container,
    Form,
    Header,
    List,
    Menu,
    Message,
    TextArea,
    Transition
} from 'semantic-ui-react';
import Logo from '../components/header/v1/images/logo.svg';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactSVG from 'react-svg';
import store from '../store';

class About extends Component {
    constructor(props) {
        super(props)
        this.state = {
            msg: '',
            messageSent: false
        }

        this.onChangeMsg = this.onChangeMsg.bind(this)
        this.sendContactMsg = this.sendContactMsg.bind(this)
    }

    componentWillMount() {
        let tab = 'about'
        if(this.props.match.params.tab) {
            tab = this.props.match.params.tab
        }
        this.setState({ activeItem: tab })
    }

    handleItemClick = (e, { name }) => {
        const link = name === 'about' ? '/about' : `/about/${name}`
        this.props.history.push(`${link}`)
        this.setState({ activeItem: name })
    }

    onChangeMsg = (e, { value }) => this.setState({ msg: value })

    sendContactMsg = e => {
        if(this.state.msg !== '') {
            this.props.sendContactMsg({ msg: this.state.msg })
            this.setState({ msg: '' })
        }
    }

    render() {
        const { activeItem, msg } = this.state
        const AboutSection = () => (
            <div>
                <p>
                    Blather is an educational tool that allows users to analyze and pinpoint the accuracy of claims made on social media. This site is meant to help people spot out erroneous logic so that similar arguments will not be made in the future. However, there are a number of factors that make this a difficult task.
                </p>
                <List bulleted>
                    <List.Item>Cognitive dissonance</List.Item>
                    <List.Item>Confirmation bias</List.Item>
                    <List.Item>Conspiratorial thinking</List.Item>
                    <List.Item>Ego</List.Item>
                    <List.Item>Fear or a reluctance to admit when we’re wrong</List.Item>
                    <List.Item>Groupthink</List.Item>
                    <List.Item>Ideology</List.Item>
                    <List.Item>Ignorance</List.Item>
                    <List.Item>Intellectual laziness</List.Item>
                    <List.Item>Lack of self-awareness</List.Item>
                    <List.Item>Political partisanship</List.Item>
                    <List.Item>Style over substance</List.Item>
                    <List.Item>Tradition</List.Item>
                    <List.Item>Tribalism</List.Item>
                </List>
                <p>
                    Unfortunately, all of those are baked into the human psyche and they help contribute to a toxic landscape that hinders perfectly sane people from engaging in honest, fact-based discussions. In essence, Blather is about restoring what it means to have a discussion; which is to change minds.
                </p>
            </div>
        )
        const ContactSection = props => (
            <div>
                <Form 
                    className='contactForm'
                    onSubmit={this.sendContactMsg}
                    success={props.messageSent}
                >
                    <Form.Field>
                        <p>Drop us a message and let us know what's on your mind.</p>
                        <TextArea 
                            className='contactTextarea' 
                            onChange={this.onChangeMsg}
                            rows={6} 
                            value={msg}
                        />
                    </Form.Field>
                    <Transition visible={props.messageSent} animation='fade down' duration={500}>
                        <Message 
                            content='You should receive a response within a few days'
                            header='Message Sent'
                            success
                        />
                    </Transition>
                    <Button type='submit'>Send</Button>
                </Form>
            </div>
        )
        const PrivacySection = () => (
            <div></div>
        )
        const showContent = props => {
            switch(activeItem) {
                case'about':
                    return (
                        <div>
                            {AboutSection()}
                        </div>
                    )
                case'contact':
                    return (
                        <div>
                            {ContactSection(props)}
                        </div>
                    )
                case'privacy':
                    return (
                        <div>
                            {PrivacySection()}
                        </div>
                    )
                default:
                    return null
            }
        }

        return (
            <Provider store={store}>
                <div className='aboutPage'>
                    <DisplayMetaTags page='about' props={this.props} state={this.state} />
                    <PageHeader
                        {...this.props}
                    />
                    <Container
                        className='mainContainer forText'
                        textAlign='left'
                    >
                        <Container className='logoContainer' textAlign='center'>
                            <Header className='aboutHeader' size='huge' textAlign='center'>
                                <ReactSVG
                                    className='blatherLogo'
                                    evalScripts='always'
                                    path={Logo}
                                    svgClassName='blatherLogoSvg'
                                />
                                Blather
                                <Header.Subheader>
                                    It's not what you think; it's how you think
                                </Header.Subheader>
                            </Header>
                        </Container>
                        <Menu pointing secondary>
                            <Menu.Item
                                active={activeItem === 'about'}
                                name='about'
                                onClick={this.handleItemClick}
                            />
                            <Menu.Item
                                active={activeItem === 'privacy'}
                                name='privacy'
                                onClick={this.handleItemClick}
                            />
                            <Menu.Item
                                active={activeItem === 'contact'}
                                name='contact'
                                onClick={this.handleItemClick}
                            />
                        </Menu>
                        <Container>
                            {showContent(this.props)}
                        </Container>
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

About.propTypes = {
    messageSent: PropTypes.bool,
    sendContactMsg: PropTypes.func
}

About.defaultProps = {
    messageSent: false,
    sendContactMsg: sendContactMsg
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.about,
        ...ownProps
    }
}

export default connect(mapStateToProps, { 
    sendContactMsg 
})(About)