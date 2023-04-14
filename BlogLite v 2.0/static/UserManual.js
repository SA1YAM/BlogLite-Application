import Header from "./Header.js"

export default{
	template: `
		<div>
			<navigation></navigation>
			<br><br>
				<div class = "px-4 mt-4">
				<h1 class="text-center">Welcome to Blog-Lite application</h1>
				<br><br>
				<h5 class = "text-xl-center"> Connect to other users by using Blog-Lite which is very easy to use.</h5>
				<br><br><br><br>
				
				<div class="container text-center">
					<div class="row">
						<div class="col text-start">
						<p class = "text-md-start fs-5">Have a quick grasp of the functionality given below for better understanding.</p>
						<ul class="list-unstyled fs-5">
							<ul>
								<li>It is a multi-user social platfdorm Single Page Application</li>
								<li>User can create multiple blogs.</li>
								<li>Each blog will have title,Caption,Image file url and Archive Switch</li>
								<li>At the bottom of the blog the status of the blog will be shown in MyProfile i.e archived or not archived.</li>
								<li>Each blog can be edited or deleted</li>
								<li>User can connect to other users and follow/unfollow them</li>
								<li>All the vlogs created by the users which current user is following will be shown in user's feed</li>
								<li>User can message other users by adding them to the inbox</li>
								<li>User can export his blogs in a zip file which will be containing a csv file and blogs images.</li>
								<li>Daily reminder is sent to those who have not logged in or created any blogs</li>
								<li>A monthly engagement report will be sent to the users as per their choosen formats</li>
							</ul>
						</ul>
						</div>
					</div>
				
					<br><br><br><br>
					
				</div>
			</div>
		</div>
	`,
	
	components:{
		"navigation": Header 
	}
	
}