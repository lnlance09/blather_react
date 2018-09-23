import "./css/index.css";
import { DisplayMetaTags } from "utils/metaFunctions";
import { connect, Provider } from "react-redux";
import {
    Accordion,
    Container,
    Form,
    Grid,
    Icon,
    Input,
    Menu
} from "semantic-ui-react";
import PageFooter from "components/footer/v1/";
import PageHeader from "components/header/v1/";
import PropTypes from "prop-types";
import qs from "query-string";
import rawFallacies from "fallacies.json";
import React, { Component } from "react";
import SearchResults from "components/searchResults/v1/";
import store from "store";

class SearchPage extends Component {
    constructor(props) {
        super(props);
        const query = qs.parse(this.props.location.search);
        const type = this.props.match.params.type;
        const currentState = store.getState();
        const bearer = currentState.user.bearer;
        const authenticated = currentState.user.authenticated;
        const types = ["fallacies", "twitter", "users", "youtube"];

        this.state = {
            activeIndex: 0,
            activeItem: types.indexOf(type) === -1 ? "twitter" : type,
            authenticated,
            bearer,
            fallacies: query.fallacies ? query.fallacies.split(",") : [],
            types,
            user: currentState.user.data,
            value: query.q
        };

        this.onChangeSearchValue = this.onChangeSearchValue.bind(this);
    }

    handleClick = (e, titleProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({ activeIndex: newIndex });
    };

    handleItemClick = (e, { name }) => {
        this.setState({
            activeItem: name,
            page: 0
        });
        this.props.history.push(`/search/${name}?q=${this.state.value}`);
    };

    handleRadioClick = (e, { value }) => {
        let fallacies = [...this.state.fallacies];
        const index = this.state.fallacies.indexOf(value);
        if (index === -1) {
            fallacies = [...this.state.fallacies, value];
        } else {
            fallacies = this.state.fallacies.filter(i => i !== value);
        }
        this.setState({
            activeItem: "fallacies",
            fallacies: fallacies,
            page: 0
        });

        const fallaciesString = fallacies.join(",");
        this.props.history.push(
            `/search/fallacies?q=${
                this.state.value
            }&fallacies=${fallaciesString}`
        );
    };

    onChangeSearchValue(value) {
        this.setState({
            page: 0,
            value
        });
        if (value !== undefined) {
            this.props.history.push(
                `/search/${this.state.activeItem}?q=${value}`
            );
        }
    }

    render() {
        const {
            activeIndex,
            activeItem,
            authenticated,
            bearer,
            fallacies,
            page,
            value,
            user
        } = this.state;
        const fallacyItem = rawFallacies.map((item, i) => (
            <Form.Checkbox
                checked={fallacies.indexOf(item.id.toString()) !== -1}
                key={`fallacy_${i}`}
                label={item.name}
                name="fallacies"
                onClick={this.handleRadioClick}
                value={item.id}
            />
        ));
        const fallacyForm = (
            <Form>
                <Form.Group grouped>{fallacyItem}</Form.Group>
            </Form>
        );

        return (
            <Provider store={store}>
                <div className="searchPage">
                    <DisplayMetaTags
                        page="search"
                        props={this.props}
                        state={this.state}
                    />
                    <PageHeader {...this.props} />
                    <Container className="mainContainer" textAlign="left">
                        <Grid>
                            <Grid.Column width={5}>
                                <Accordion
                                    as={Menu}
                                    className="searchMenu"
                                    borderless
                                    fluid
                                    vertical
                                >
                                    <Menu.Item>
                                        <Input
                                            icon="search"
                                            onChange={e =>
                                                this.onChangeSearchValue(
                                                    e.target.value
                                                )
                                            }
                                            onKeyPress={e => {
                                                if (e.key === "Enter") {
                                                    this.submitSearchForm();
                                                }
                                            }}
                                            placeholder="Search..."
                                            value={value}
                                        />
                                    </Menu.Item>
                                    <Menu.Item
                                        active={activeItem === "twitter"}
                                        name="twitter"
                                        onClick={this.handleItemClick}
                                    >
                                        Profiles
                                        <Icon
                                            className="twitterIcon"
                                            inverted={activeItem === "twitter"}
                                            name="twitter"
                                        />
                                    </Menu.Item>
                                    <Menu.Item
                                        active={activeItem === "youtube"}
                                        name="youtube"
                                        onClick={this.handleItemClick}
                                    >
                                        Channels
                                        <Icon
                                            className="youtubeIcon"
                                            inverted={activeItem === "youtube"}
                                            name="youtube"
                                        />
                                    </Menu.Item>
                                    <Menu.Item
                                        active={activeItem === "users"}
                                        name="users"
                                        onClick={this.handleItemClick}
                                    >
                                        Users
                                        <Icon
                                            className="usersIcon"
                                            inverted={activeItem === "users"}
                                            name="user circle"
                                        />
                                    </Menu.Item>
                                    <Menu.Item>
                                        <Accordion.Title
                                            active={activeIndex === 0}
                                            content="Fallacies"
                                            index={0}
                                            name="fallacies"
                                            onClick={this.handleClick}
                                        />
                                        <Accordion.Content
                                            active={activeIndex === 0}
                                            content={fallacyForm}
                                        />
                                    </Menu.Item>
                                </Accordion>
                            </Grid.Column>

                            <Grid.Column className="rightSide" width={11}>
                                <SearchResults
                                    authenticated={authenticated}
                                    bearer={bearer}
                                    fallacies={fallacies.join(",")}
                                    history={this.props.history}
                                    linkedTwitter={
                                        authenticated
                                            ? user.linkedTwitter
                                            : false
                                    }
                                    linkedYoutube={
                                        authenticated
                                            ? user.linkedYoutube
                                            : false
                                    }
                                    page={page}
                                    q={value}
                                    type={activeItem}
                                />
                            </Grid.Column>
                        </Grid>
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        );
    }
}

SearchPage.propTypes = {
    pageType: PropTypes.string
};

SearchPage.defaultProps = {
    pageType: "search"
};

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.page,
        ...ownProps
    };
};

export default connect(
    mapStateToProps,
    {}
)(SearchPage);