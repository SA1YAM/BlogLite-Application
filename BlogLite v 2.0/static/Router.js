import Dashboard from "./Dashboard.js"
import Followers from "./Followers.js"
import Following from "./Following.js"
import Search from "./Search.js"
import MyProfile from "./MyProfile.js"
import CreatePost from "./CreatePost.js"
import EditPost from "./EditPost.js"
import Signin from "./Signin.js"
import Signup from "./Signup.js"
import Logout from "./Logout.js"
import AddPhoto from "./AddPhoto.js"
import EditPhoto from "./EditPhoto.js"
import DeletePhoto from "./DeletePhoto.js"
import Inbox from "./Inbox.js"
import Message from "./Message.js"
import ViewPost from "./ViewPost.js"
import DeletePost from "./DeletePost.js"
import OtherProfile from "./OtherProfile.js"
import OtherFollowers from "./OtherFollowers.js"
import OtherFollowing from "./OtherFollowing.js"
import DeleteUser from "./DeleteUser.js"
import ReportFormat from "./ReportFormat.js"
import UserManual from "./UserManual.js"


const routes = [
	{path: "/",name:"Signin", component: Signin},
	{path: "/signup",name:"Signup", component: Signup},
	{path: "/signout",name:"Logout", component: Logout},
	{path: "/dashboard",name:"Dashboard", component: Dashboard},
	{path: "/followers", name:"Followers", component: Followers},
	{path: "/following", name:"Following", component: Following},
	{path: "/myprofile", name:"MyProfile", component: MyProfile},
	{path: "/post/create", name:"CreatePost", component: CreatePost},
	{path: "/post/edit", name:"EditPost", component: EditPost},
	{path: "/search", name:"Search", component: Search},
	{path: "/addphoto", name:"AddPhoto", component: AddPhoto},
	{path: "/editphoto", name:"EditPhoto", component: EditPhoto},
	{path: "/deletephoto", name:"DeletePhoto", component: DeletePhoto},
	{path: "/inbox", name:"Inbox", component: Inbox},
	{path: "/message", name:"Message", component: Message},
	{path: "/viewPost/:postId", name:"ViewPost", component: ViewPost},
	{path: "/post/delete/:postId", name:"DeletePost", component: DeletePost},
	{path: "/otherprofile/:userName", name:"OtherProfile", component: OtherProfile},
	{path: "/otherfollowers/:userId", name:"OtherFollowers", component: OtherFollowers},
	{path: "/otherfollowing/:userId", name:"OtherFollowing", component: OtherFollowing},
	{path: "/deleteuser", name:"DeleteUser", component: DeleteUser},
	{path: "/changeformat", name:"ReportFormat", component: ReportFormat},
	{path: "/usermanual", name:"UserManual", component: UserManual}
]


export default new VueRouter({
	routes: routes
})