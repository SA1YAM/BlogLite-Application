import FetchUrl from "./FetchUrl.js"

export default {
	template: `
		<div class="container text-center">
			<div class="row align-items-center mt-5">
			</div>
			<div class="row align-items-center mt-5">
			</div>
			<div class="row align-items-center mt-5">
				<div class="alert alert-warning align-items-center border border-warning" role="alert">
				  <h4 class="alert-heading">Are you sure you want to delete this Post</h4>
				  <hr>
				  <div class="row">
					<div class="col">
						<button type="button" class="btn btn-secondary btn-lg" @click ="deletePost"> Yes </button>
					</div>
					<div class="col">
						<button type="button" class="btn btn-secondary btn-lg" @click="goBack"> No </button>
					</div>
				  </div>
				</div>
			</div>
		</div>
	`,
	
	methods: {
		deletePost: function(){
			console.log("in before")
			FetchUrl(`http://127.0.0.1:5000/api/post/${this.$route.params.postId}`, {
				method: 'delete',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
			})
			.then((data) => {
				console.log(data)
				this.$router.push({ name: 'MyProfile'})
			}).catch((err) => {
				console.log(err)
			})
			
		},
		
		goBack : function(){
			this.$router.push({ name: 'MyProfile'})
		},
	}
}