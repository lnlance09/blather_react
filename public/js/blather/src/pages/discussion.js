import './css/index.css';
import { adjustTimezone } from '../utils/dateFunctions';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { fetchDiscussion } from './actions/discussion';
import { Provider, connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    Container,
    Dimmer,
    Grid,
    Header,
    Image,
    Loader
} from 'semantic-ui-react';
import Moment from 'react-moment';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import ParagraphPic from '../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import sanitizeHtml from 'sanitize-html';
import store from '../store';
import TagsCard from '../components/tagsCard/v1/';
import TitleHeader from '../components/titleHeader/v1/';

class DiscussionPage extends Component {
    constructor(props) {
        super(props)
        const id = this.props.match.params.id
        const height = window.innerHeight
        const currentState = store.getState()
        const bearer = currentState.user.bearer
        const authenticated = currentState.user.authenticated
        const isMine = currentState.user.id === this.props.user.id
        this.state = {
            authenticated,
            bearer,
            height,
            id,
            isMine
        }
    }

    componentWillMount() {
        if(this.props.id === undefined) {
            this.props.fetchDiscussion({bearer: this.state.bearer, id: this.state.id})
        }
    }

    sanitizeHtml(html) {
        const sanitized = sanitizeHtml(html, {
            allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol' ],
            allowedAttributes: {
                'a': [ 'href' ]
            },
            allowedIframeHostnames: ['www.youtube.com']
        })
        return { __html:  sanitized}
    }

    render() {
        const { bearer, height, id, isMine } = this.state
        const createdAt = adjustTimezone(this.props.date_created)
        const EvidenceSection = props => {
            return (
                <div>
                    <Container fluid>
                        <Header as='h2' size='medium'>
                            Evidence
                        </Header>
                        {!props.description && (
                            <div>
                                <Dimmer active inverted>
                                    <Loader active inline='centered' size='medium' />
                                </Dimmer>
                                <Image src={ParagraphPic} fluid /> 
                            </div>
                        )}
                        {props.description && (
                            <p>{props.description}</p>
                        )}

                        <Header ash='h3' size='medium'>
                            What's needed to change {this.props.user.name}'s mind
                        </Header>
                        {!props.extra && (
                            <div>
                                <Dimmer active inverted>
                                    <Loader active inline='centered' size='medium' />
                                </Dimmer>
                                <Image src={ParagraphPic} fluid /> 
                            </div>
                        )}
                        {props.extra && (
                            <p>{props.extra}</p>
                        )}
                    </Container>
                </div>
            )
        }
        const HeaderSection = ({props}) => {
            const subheader = (
                <div>
                    Created <Moment date={createdAt} fromNow interval={60000} /> by <Link to={`/users/${props.user.username}`}>{props.user.name}</Link>
                </div>
            )
            return (
                <TitleHeader
                    bearer={bearer}
                    dividing
                    id={id}
                    canEdit={isMine}
                    subheader={subheader}
                    title={props.title}
                    type='discussion'
                />
            )
        }
        const ShowTags = props => {
            let tags = null
            if(props.tag_ids) {
                const tagIds = props.tag_ids.split(',')
                const tagNames = props.tag_names.split(',')
                Array.prototype.zip = function(arr) {
                    return this.map(function(e, i) {
                        return {id: e, name: arr[i]}
                    })
                }
                tags = tagIds.zip(tagNames)
            }

            return (
                <TagsCard 
                    bearer={bearer}
                    canEdit={isMine}
                    id={props.id}
                    loading={tags ? false : true}
                    tags={tags ? tags : []}
                    type='discussion'
                />
            )
        }

        return (
            <Provider store={store}>
                <div className='discussionPage'>
                    <DisplayMetaTags page='discussion' props={this.props} state={this.state} />
                    <PageHeader
                        {...this.props}
                    />
                    <Container
                        className='mainContainer'
                        style={{ marginTop: '5em', minHeight: height +'px' }}
                        textAlign='left'
                    >
                        <HeaderSection props={this.props} />
                        <Grid>
                            <Grid.Column className='leftSide' width={12}>
                                {EvidenceSection(this.props)}
                            </Grid.Column>
                            <Grid.Column className='rightSide' width={4}>
                                {ShowTags(this.props)}
                            </Grid.Column>
                        </Grid>
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

DiscussionPage.propTypes = {
    date_created: PropTypes.string,
    description: PropTypes.string,
    extra: PropTypes.string,
    fetchDiscussion: PropTypes.func,
    id: PropTypes.number,
    tag_ids: PropTypes.string,
    tag_names: PropTypes.string,
    title: PropTypes.string,
    user: {
        id: PropTypes.number,
        img: PropTypes.string,
        name: PropTypes.string,
        username: PropTypes.string
    }
}

DiscussionPage.defaultProps = {
    fetchDiscussios: fetchDiscussion,
    user: {}
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.discussion,
        ...ownProps
    }
}

export default connect(mapStateToProps, { fetchDiscussion })(DiscussionPage)