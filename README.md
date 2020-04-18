# blather_react
API Endpoints

1. Contact
    1. send - send message
2. Discussions
    1. index - get a discussion by its ID. database->getDiscussion()
    2. create - validate from fields and either create or update a discussion. database->getDiscussion. If discussion does not exist, database->createDiscussion. If discussion does exist, database->updateDiscussion
    3. getTags - database->getTags. fetch the tags that can be added to a discussion in the dropdown
    4. getUsers - database->getDiscussionUsers. fetch the users that be used for the filters when searching 
    5. search - database->searchDiscussions. 
3. Fallacies 
    1. index - get fallacy by its ID.
    2. assign - assign a fallacy
    3. getCommentCount
    4. getComments
    5. parseUrl - parse a URL by getting information about it with its corresponding API
    6. postComment
    7. search
    8. update
4. Pages
    1. index - get information about a social media user from their username or id. 
    2. getPagePosts
        1. twitter - twitter->getStatuses()
        2. youtube - youtube->getUserVideos()
5. Search 
    1. advanced - search users, fallacies, twitter, facebook, and youtube profiles
        1. twitter - if linked account, twitter->search()
        2. twitter - if not linked account, database->searchPages()
        3. youtube - if linked account, youtube->searchPages()
        4. youtube - if not linked account, database->searchPages
        5. users - users->searchUsers
        6. fallacies
            1. twitter - twitter->getPageFallacies
            2. youtube - youtube->getVideoFallacies
6. Seo
    1. index - get all links for sitemap
7. Settings
    1. recover - recover password. users->userLookUpByEmail(). users->setNewPassword()
8. Twitter 
    1. getCredentials - twitter->getAccessToken(), twitter->getRequestToken(), users->updateUser(), users->setTwitterDetails()
    2. nextTweetsPage - twitter->getStatuses()
    3. remove - users->updateUser, getRequestToken
    4. tweet - 
        1. if linked twitter and logged in, twitter->getTweetInfo(), twitter->insertTweet()
        2. if not logged in or account not linked, twitter->getTweetInfoFromDB()
        3. twitter->getPageFallacyCount(), users->getArchivedLinks()
9. Users
    1. changePassword - users->getUserByCurrentPassword(), users->updateUser()
    2. changeProfilePic - users->updateUser()
    3. create - users->createUser()
    4. createArchive - users->createArchive()
    5. getArchivedLinks - users->getArchivedLinks()
    6. getInfo - users->getUserInfo()
    7. login - users->login(), fb->loginUrl, youTube->getTokenUrl(), twitter->getRequestToken()
    8. lookup - users->userLookUp()
    9. register - users->register()
    10. update - users->updateUser()
    11. verifyEmail - users->updateUser()
