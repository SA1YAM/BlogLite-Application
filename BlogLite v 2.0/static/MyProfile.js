import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default {
	template: `
	<div>
		<navigation></navigation>
		<br><br>
		<div id="app" class="container text-center ">
			<div class="row row-cols-4">
				<div class="col">
					<div class="card border-dark mb-3"> 
						<div class="card-body text-start">
							<div class="row">
								<div class="col">
									<h5 class="card-title">{{ current_user.username }}</h5>
								</div>
								<div class="col">
									<div class="dropdown card-title text-end" v-if="current_user.profile_photo">
										  <button class="btn btn-secondary btn-sm text-bg-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											⋮
										  </button>
										  <ul class="dropdown-menu">
											<li><router-link :to="{ name: 'EditPhoto' }" class="dropdown-item" >Edit Photo</router-link></li>
											<li><router-link :to="{ name: 'DeletePhoto' }" class="dropdown-item" >Delete Photo</router-link></li>
										  </ul>
									</div>
									<div class="dropdown card-title text-end" v-else>
										  <button class="btn btn-secondary btn-sm text-bg-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
											⋮
										  </button>
										  <ul class="dropdown-menu">
											<li><router-link :to="{ name: 'AddPhoto' }" class="dropdown-item" >Add Photo</router-link></li>
										  </ul>
									</div>
								</div>
							</div>
							
							<br>
							<img v-bind:src="'../static/Images/' + current_user.profile_photo" class="card-img-bottom" alt="..." v-if="current_user.profile_photo">
							<h6 class="text-center card-img-bottom" v-else>No Photo Uploaded</h6>
							
							<br> 
							
						</div>
					</div>
				</div>
				<div class="col text-secondary">
					<br><br>
					<h5 class="card-title">Total Posts</h5>
					<h6 class="card-title">{{ current_user.total_posts }}</h6>
				</div>
				<div class="col">
					<br><br>
					<h5 class="card-title text-primary"><router-link :to="{ name: 'Followers' }" class="dropdown-item" >Followers</router-link></h5>
					<h6 class="card-title text-secondary">{{ current_user.followers }}</h6>
				</div>
				<div class="col">
					<br><br>
					<h5 class="card-title text-primary"><router-link :to="{ name: 'Following' }" class="dropdown-item" >Following</router-link></h5>
					<h6 class="card-title text-secondary">{{ current_user.following }}</h6>
				</div>
				
			</div>
			
			<br><br><br>
			<div class="row">
				<div class="col text-start">
					<h3 class="card-title">My Blogs:</h3>
				</div>			
			</div>
			
			<br><br>
			<div class="row justify-content-center" v-if="current_user.posts.length > 0">
				<div class="col text-end mb-3">
					  <button type="button" class="btn btn-primary btn-lg" @click="export_csv" >Export</button>
				</div>
				<div class="row row-cols-3">
					<div class="col" v-for="post in current_user.posts">
						<div class="card border-dark mb-3" style="width: 20rem;"> 
						
							<div class="card-body text-start">
								<div class="row">
									<div class="col">
										<h5 class="card-title"><router-link :to="{ name: 'ViewPost', params: {postId: post.post_id } }" class="link-dark" >{{post.title}}</router-link></h5>
										<small class="fw-semibold text-secondary" v-if="post.updated">Updated On: {{post.time_stamp}}</small>
										<small class="fw-semibold text-secondary" v-else>Created On: {{post.time_stamp}}</small>
									</div>
									<div class="col">
										<div class="dropdown card-title text-end">
											  <button class="btn btn-secondary btn-sm text-bg-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
												⋮
											  </button>
											  <ul class="dropdown-menu">
												<li><router-link :to="{ name: 'EditPost' , query: { postId: post.post_id, title: post.title, caption: post.caption, archive_switch: post.archive_switch, image_url: post.image_url }}" class="dropdown-item" >Edit</router-link></li>
												<router-link :to="{ name: 'DeletePost' , params: {postId: post.post_id} }" class="dropdown-item" role="button" >Delete</router-link>
											  </ul>
										</div>
									</div>
								</div>
								<br>
								<img v-bind:src="'../static/Images/' + post.image_url" class="card-img-bottom" alt="...">
								
								<br> <br>
								<p class="card-text">{{post.caption}}</p>
									
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col">
										<small class="fw-semibold text-warning" v-if="post.archive_switch">archived</small>
										<small class="fw-semibold text-success" v-else>not archived</small>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="row justify-content-center" v-else> 
				<h5 class="text-secondary">You have not created any posts so far. please create posts</h5>
			</div>
		</div>
	</div>
	`,
	
	components:{
		"navigation": Header 
	},
	
	data: function() {
		return {
			current_user: {},
		}
	},
	
	methods: {
		export_csv: function(){
			FetchUrl("http://127.0.0.1:5000/api/export", {
				method: 'get',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
			})
			.then((data) => {
				console.log(data)
				alert(data.message)
			}).catch((err) => {
			console.log(err)
			})	
		},
	},
	
	mounted: function() {
		
		console.log(this.current_user)
		
		FetchUrl("http://127.0.0.1:5000/api/myprofile", {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			this.current_user = data
		}).catch((err) => {
		console.log(err)
		})
	},
	
	updated: function() {
		let postNames = []
		if(this.current_user.posts.length > 0){
			for (let post of this.current_user.posts){
				postNames.push(post.title)
			}
			console.log(postNames)
			sessionStorage.setItem("postNames", JSON.stringify(postNames))
		} else {
			sessionStorage.removeItem("postNames")
		}
		
	},
	
}