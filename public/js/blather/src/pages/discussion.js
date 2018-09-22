import './css/index.css';
import { adjustTimezone } from '../utils/dateFunctions';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { sanitizeText } from '../utils/textFunctions';
import { fetchDiscussion, updateDescription, updateDiscussion, updateExtra } from './actions/discussion';
import { Provider, connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    Button,
    Container,
    Dimmer,
    Form,
    Grid,
    Header,
    Icon,
    Image,
    Loader,
    TextArea
} from 'semantic-ui-react';
import Marked from 'marked';
import Moment from 'react-moment';
import Conversation from '../components/conversation/v1/';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import ParagraphPic from '../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from '../store';
import TagsCard from '../components/tagsCard/v1/';
import TitleHeader from '../components/titleHeader/v1/';

class DiscussionPage extends Component {
    constructor(props) {
        super(props)
        const height = window.innerHeight
        const id = parseInt(this.props.match.params.id,10)
        const currentState = store.getState()
        const user = currentState.user
        const bearer = user.bearer
        const authenticated = user.authenticated

        Marked.setOptions({
            renderer: new Marked.Renderer(),
            highlight: function(code) {
                // return require('highlight.js').highlightAuto(code).value;
            },
            pedantic: false,
            breaks: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false
        })

        this.state = {
            authenticated,
            bearer,
            editingDescription: false,
            editingExtra: false,
            height,
            id,
            user
        }

        this.onClickEditDescription = this.onClickEditDescription.bind(this)
        this.onClickEditExtra = this.onClickEditExtra.bind(this)
        this.updateDescription = this.updateDescription.bind(this)
        this.updateExtra = this.updateExtra.bind(this)
    }

    componentWillMount() {
        if(this.props.id === undefined) {
            this.props.fetchDiscussion({bearer: this.state.bearer, id: this.state.id})
        }
    }

    onClickEditDescription = () => {
        this.setState({ editingDescription: this.state.editingDescription === false })
    }

    onClickEditExtra = () => {
        this.setState({ editingExtra: this.state.editingExtra === false })
    }

    updateDescription = (e, { value }) => {
        this.props.updateDescription({ description: value })
    }

    updateDiscussion = () => {
        if(this.props.description && this.props.extra !== '') {
            this.props.updateDiscussion({ 
                bearer: this.state.bearer,
                description: this.props.description,
                extra: this.props.extra,
                id: this.props.id
            })
            this.setState({ editingDescription: false, editingExtra: false })
        }
    }

    updateExtra = (e, { value }) => {
        this.props.updateExtra({ extra: value })
    }

    render() {
        const { authenticated, bearer, editingDescription, editingExtra, height, id, user } = this.state
        const createdAt = adjustTimezone(this.props.date_created)
        const isMine = this.props.createdBy ? parseInt(user.data.id,10) === this.props.createdBy.id : false
        const EditButton = ({props, type}) => {
            if(isMine) {
                if(type === 'description') {
                    if(props.description) {
                        if(editingDescription) {
                            return (<Icon className='editButton editing' name='close' onClick={this.onClickEditDescription} />)
                        }
                        return (<Icon className='editButton' name='pencil' onClick={this.onClickEditDescription} />)
                    }
                }
                if(type === 'extra') {
                    if(props.extra) {
                        if(editingExtra) {
                            return (<Icon className='editButton editing' name='close' onClick={this.onClickEditExtra} />)
                        }
                        return (<Icon className='editButton' name='pencil' onClick={this.onClickEditExtra} />)
                    }
                }
            }
            return null
        }
        const EvidenceSection = props => {
            return (
                <div>
                    <Container fluid>
                        <Header as='h2' size='medium'>
                            Evidence
                            <EditButton props={props} type='description' />
                        </Header>
                        {editingDescription && (
                            <Form onSubmit={this.updateDiscussion}>
                                <Form.Field>
                                    <TextArea 
                                        onChange={this.updateDescription}
                                        placeholder='What is your evidence? Try to use reputable sources.'
                                        rows={15}
                                        value={props.description}
                                    />
                                </Form.Field>
                                <Button 
                                    className='updateDiscussionBtn'
                                    compact
                                    content='Update'
                                    fluid
                                    type='submit'
                                />
                            </Form>
                        )}
                        {!editingDescription && (
                            <div>
                                {!props.description && (
                                    <div>
                                        <Dimmer active inverted>
                                            <Loader active inline='centered' size='medium' />
                                        </Dimmer>
                                        <Image src={ParagraphPic} fluid /> 
                                    </div>
                                )}
                                {props.description && (
                                    <div
                                        dangerouslySetInnerHTML={{__html: sanitizeText(Marked(props.description))}}
                                    ></div>
                                )}
                            </div>
                        )}
                        <Header ash='h3' size='medium'>
                            {props.createdBy ? `What's needed to change ${props.createdBy.name}'s mind` : ''}
                            <EditButton props={props} type='extra' />
                        </Header>
                        {editingExtra && (
                            <Form onSubmit={this.updateDiscussion}>
                                <Form.Field>
                                    <TextArea 
                                        onChange={this.updateExtra}
                                        placeholder='What is your evidence? Try to use reputable sources.'
                                        rows={15}
                                        value={props.extra}
                                    />
                                </Form.Field>
                                <Button 
                                    className='updateDiscussionBtn'
                                    compact
                                    content='Update'
                                    fluid
                                    type='submit'
                                />
                            </Form>
                        )}
                        {!editingExtra && (
                            <div>
                                {!props.extra && (
                                    <div>
                                        <Dimmer active inverted>
                                            <Loader active inline='centered' size='medium' />
                                        </Dimmer>
                                        <Image src={ParagraphPic} fluid /> 
                                    </div>
                                )}
                                {props.extra && (
                                    <div
                                        dangerouslySetInnerHTML={{__html: sanitizeText(Marked(props.extra))}}
                                    ></div>
                                )}
                            </div>
                        )}
                    </Container>
                </div>
            )
        }
        const HeaderSection = ({props}) => {
            let subheader = null
            if(props.createdBy) {
                subheader = (
                    <div>
                        Created <Moment date={createdAt} fromNow interval={60000} /> {' '}
                        by <Link to={`/users/${props.createdBy.username}`}>{props.createdBy.name}</Link>
                    </div>
                )
            }
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
            if(props.tagIds) {
                let tagIds = props.tagIds.split(',')
                let tagNames = props.tagNames.split(',')
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
                                <Conversation 
                                    acceptedBy={this.props.acceptedBy}
                                    authenticated={authenticated}
                                    bearer={bearer}
                                    createdBy={this.props.createdBy}
                                    discussionId={id}
                                    loading={this.props.convoLoading}
                                    source='discussion'
                                    status={this.props.status}
                                />
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
    acceptedBy: PropTypes.shape({
        id: PropTypes.number,
        img: PropTypes.string,
        name: PropTypes.string,
        username: PropTypes.string
    }),
    createdBy: PropTypes.shape({
        id: PropTypes.number,
        img: PropTypes.string,
        name: PropTypes.string,
        username: PropTypes.string
    }),
    convoLoading: PropTypes.bool,
    dateCreated: PropTypes.string,
    description: PropTypes.string,
    extra: PropTypes.string,
    fetchDiscussion: PropTypes.func,
    id: PropTypes.number,
    status: PropTypes.number,
    tagIds: PropTypes.string,
    tagNames: PropTypes.string,
    title: PropTypes.string,
    updateDescription: PropTypes.func,
    updateDiscussion: PropTypes.func,
    updateExtra: PropTypes.func
}

DiscussionPage.defaultProps = {
    convoLoading: true,
    fetchDiscussios: fetchDiscussion,
    user: null,
    updateDescription: updateDescription,
    updateDiscussion: updateDiscussion,
    updateExtra: updateExtra
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.discussion,
        ...ownProps
    }
}

export default connect(mapStateToProps, { 
    fetchDiscussion,
    updateDescription,
    updateDiscussion,
    updateExtra
})(DiscussionPage)