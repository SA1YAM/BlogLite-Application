import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default {
	template: `
	<div>
		<navigation></navigation>
		<br><br>
		<div id="app" class="container text-center" v-if="other_user">
			<div class="row row-cols-4 mb-5 justify-content-center">
				<h3 class="text-dark text-center">{{ other_user.username }} Profile</h3>
			</div>
			<div class="row row-cols-4">
				<div class="col">
					<div class="card border-dark mb-3"> 
						<div class="card-body text-start">
							<div class="row">
								<div class="col">
									<h5 class="card-title">{{ other_user.username }}</h5>
								</div>
								<div class="col">
									
								</div>
							</div>
							
							<br>
							<img v-bind:src="'../static/Images/' + other_user.profile_photo" class="card-img-bottom" alt="..." v-if="other_user.profile_photo">
							<h6 class="text-center card-img-bottom" v-else>No Photo Uploaded</h6>
							
							<br> 
							
						</div>
					</div>
				</div>
				<div class="col text-secondary">
					<br><br>
					<h5 class="card-title">Total Posts</h5>
					<h6 class="card-title">{{ other_user.total_posts }}</h6>
				</div>
				<div class="col">
					<br><br>
					<h5 class="card-title text-primary"><router-link :to="{ name: 'OtherFollowers', params : { userId : other_user.id }, query: { username: other_user.username } }" class="dropdown-item" >Followers</router-link></h5>
					<h6 class="card-title text-secondary">{{ other_user.followers }}</h6>
				</div>
				<div class="col">
					<br><br>
					<h5 class="card-title text-primary"><router-link :to="{ name: 'OtherFollowing', params : { userId: other_user.id } , query: { username: other_user.username } }" class="dropdown-item" >Following</router-link></h5>
					<h6 class="card-title text-secondary">{{ other_user.following }}</h6>
				</div>
				
			</div>
			
			<br><br><br>
			<div class="row">
				<div class="col text-start">
					<h3 class="card-title">{{other_user.username}} Blogs:</h3>
				</div>
				<div class="col">
					  
				</div>
			</div>
			
			<br><br>

			<div class="row row-cols-3">
				<div class="col" v-for="post in other_user.posts"> 
					<div class="card border-dark mb-3" style="width: 20rem;" v-if="!post.archive_switch">
						<div class="card-body text-start">
							<div class="row">
								<div class="col">
									<h5 class="card-title">{{post.title}}</h5>
									<small class="fw-semibold text-secondary">Created On: {{post.time_stamp}}</small>
								</div>
								<div class="col">
								
								</div>
							</div>
							<br>
							<img v-bind:src="'../static/Images/' + post.image_url" class="card-img-bottom" alt="...">
							
							<br> <br>
							<p class="card-text">{{post.caption}}</p>
								
						</div>
					</div>
				</div>
			</div>
		</div>
		<div id="app" class="container text-center" v-else>
			<h3 class="text-dark text-center">This User has deleted their profile</h3>
		<div>
	</div>
	`,
	
	components:{
		"navigation": Header 
	},
	
	data: function() {
		return {
			other_user: {},
		}
	},
	
	mounted: function() {
		
		console.log(this.other_user)
		
		FetchUrl(`http://127.0.0.1:5000/api/otherprofile/${this.$route.params.userName}`, {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			this.other_user = data
				if(!data.username){
					this.other_user = null
				}
		}).catch((err) => {
		console.log(err)
		})
	},
	
}