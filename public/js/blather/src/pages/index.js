import './css/index.css';
import { refreshYouTubeToken } from '../components/authentication/v1/actions';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { fetchPageData } from './actions/page';
import { Provider, connect } from 'react-redux';
import { withRouter } from 'react-router';
import { 
    Button,
    Container,
    Dimmer,
    Grid,
    Header,
    Icon,
    Image,
    Menu,
    Segment,
    Transition
} from 'semantic-ui-react';
import AboutCard from '../components/aboutCard/v1/';
import defaultImg from '../images/image-square.png';
import FallaciesList from '../components/fallaciesList/v1/';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import ParagraphPic from '../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from '../store';
import TitleHeader from '../components/titleHeader/v1/';
import TrumpImg from './images/trump.svg';
import TweetList from '../components/tweetList/v1/';
import VideoList from '../components/videoList/v1/';

class SocialMediaPage extends Component {
    constructor(props) {
        super(props)
        document.body.style.background = '#fff'
        const height = window.innerHeight;
        const id = this.props.match.params.id
        const network = this.props.match.params.network
        const tab = this.props.match.params.tab
        const label = this.determineItemsLabel(network)
        const currentState = store.getState()
        const authenticated = currentState.user.authenticated
        const bearer = currentState.user.bearer

        this.state = { 
            activeItem: tab === 'fallacies' ? tab : label,
            animation: 'horizontal flip',
            authenticated,
            bearer,
            duration: 500,
            height,
            id,
            itemsLabel: label,
            network,
            page: 0,
            visible: false
        }

        this.props.fetchPageData({
            bearer: this.state.bearer,
            id: this.state.id, 
            type: this.state.network
        })
    }

    componentWillMount() {
        this.setState({ visible: true })
    }

    determineItemsLabel(network) {
        switch(network) {
            case'fb':
                return 'posts'
            case'twitter':
                return 'tweets'
            case'youtube':
                return 'videos'
            default:
                return null
        }
    }

    handleItemClick = (e, { name }) => {
        this.setState({ activeItem: name })
        this.props.history.push(`/pages/${this.state.network}/${this.state.id}/${name}`)
    }

    render() {
        const { activeItem, animation, authenticated, bearer, duration, height, id, itemsLabel, network, visible } = this.state
        if(this.props.error && this.props.errorCode !== 404 && network === 'youtube') {
            this.props.refreshYouTubeToken({
                bearer
            })
            setTimeout(() => {
                window.location.reload()
            }, 200)
        }
        const DimmerMsg = ({props}) => {
            return (
                <Dimmer active={authenticated ? false : true}>
                    <Header as='h2'>
                        {props.posts.error ? props.posts.errorMsg : 'Sign in to view'}
                    </Header>
                    {!authenticated && (
                        <Button onClick={(e) => props.history.push('/signin')}>
                            Sign in
                        </Button>
                    )}
                </Dimmer>
            )
        }
        const LazyLoadDefault = [{},{},{},{},{}].map((post, i) => {
            let marginTop = i === 0 ? 0 : 15
            return (
                <div key={`lazy_load_${i}`} style={{ marginTop: `${marginTop}px` }}>
                    <Segment className='lazyLoadSegment'>
                        <Image fluid src={ParagraphPic} />
                    </Segment>
                </div>
            )
        })
        const PageHeaderInfo = props => {
            const subheader = (
                <div>
                    {props.username && (
                        <a 
                            className='externalUrl' 
                            onClick={() => window.open(props.externalUrl, '_blank')}
                        >
                            @{props.username}
                        </a>
                    )}
                    <Icon 
                        className={`${network}Icon`}
                        name={network} 
                        style={{ marginLeft: '4px' }}
                    />
                </div>
            )
            return (
                <TitleHeader
                    subheader={subheader}
                    title={props.name}
                />
            )
        }
        const ShowContent = props => {
            if(props.id) {
                if(activeItem === 'fallacies') {
                    return (
                        <FallaciesList 
                            assignedTo={props.id}
                            history={props.history}
                            source='pages'
                        />
                    )
                }

                if(authenticated) {
                    switch(activeItem) {
                        case'tweets':
                            return (
                                <div>
                                    <TweetList 
                                        bearer={bearer} 
                                        history={props.history}
                                        username={props.username} 
                                    />
                                </div>
                            )
                        case'videos':
                            return (
                                <div>
                                    <VideoList 
                                        bearer={bearer} 
                                        channelId={id} 
                                        history={this.props.history}
                                    />
                                </div>
                            )
                        default:
                            return null
                    }
                }
            }

            return (
                <Dimmer.Dimmable as={Segment} dimmed>
                    {LazyLoadDefault}
                    <DimmerMsg props={props} />
                </Dimmer.Dimmable>
            )
        }

        return (
            <Provider store={store}>
                <div className='socialMediaPage'>
                    <DisplayMetaTags page='pages' props={this.props} state={this.state} />
                    <PageHeader 
                        {...this.props}
                    />
                    {this.props.exists && (
                        <Container 
                            className='mainContainer' 
                            style={{ minHeight: height +'px'}}
                            textAlign='left'
                        >
                            <Grid>
                                <Grid.Column width={4}>
                                    <Transition animation={animation} duration={duration} visible={visible}>
                                        <Image 
                                            className='profilePic' 
                                            onError={i => i.target.src = defaultImg}
                                            src={this.props.img} 
                                        />
                                    </Transition>
                                    <AboutCard
                                        description={this.props.about}
                                        linkify
                                        title='About'
                                    />
                                </Grid.Column>
                                <Grid.Column width={12}>
                                    {PageHeaderInfo(this.props)}
                                    <Menu
                                        className='socialMediaPageMenu' 
                                        pointing
                                        secondary
                                    >
                                        <Menu.Item 
                                            active={activeItem === itemsLabel} 
                                            name={itemsLabel}
                                            onClick={this.handleItemClick} 
                                        />
                                        <Menu.Item 
                                            active={activeItem === 'fallacies'} 
                                            name='fallacies' 
                                            onClick={this.handleItemClick} 
                                        />
                                    </Menu>
                                    <Container className='profileContentContainer'>
                                        {ShowContent(this.props)}
                                    </Container>
                                </Grid.Column>
                            </Grid>
                        </Container>
                    )}

                    {!this.props.exists && (
                        <Container 
                            className='mainContainer'
                            style={{ marginTop: '8em', minHeight: height +'px'}} 
                            text 
                            textAlign='center'
                        >
                            <Image centered disabled size='medium' src={TrumpImg} />
                            <Header size='medium'>That user does not exist!</Header>
                        </Container>
                    )}
                    <PageFooter />
                </div>
            </Provider>
        );
    }
}

SocialMediaPage.propTypes = {
    about: PropTypes.string,
    error: PropTypes.bool,
    errorCode: PropTypes.number,
    exists: PropTypes.bool,
    externalUrl: PropTypes.string,
    fetchPageData: PropTypes.func,
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    img: PropTypes.string,
    isVerified: PropTypes.bool,
    name: PropTypes.string,
    network: PropTypes.string,
    posts: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.shape({
            count: PropTypes.number,
            data: PropTypes.array,
            error: PropTypes.bool,
            errorMsg: PropTypes.string,
            errorType: PropTypes.number,
            hasMore: PropTypes.bool,
            loading: true
        })
    ]),
    refreshYouTubeToken: PropTypes.func,
    username: PropTypes.string
}

SocialMediaPage.defaultProps = {
    error: false,
    exists: true,
    fallacies: {
        count: 0,
        error: false,
        data: [{},{},{},{},{}]
    },
    fetchPageData: fetchPageData,
    img: defaultImg,
    posts: {
        count: 0,
        error: false,
        data: [{},{},{},{},{}]
    },
    refreshYouTubeToken: refreshYouTubeToken
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.page,
        ...state.user,
        ...ownProps
    }
}

export default withRouter(connect(mapStateToProps, { 
    fetchPageData, refreshYouTubeToken 
})(SocialMediaPage))
