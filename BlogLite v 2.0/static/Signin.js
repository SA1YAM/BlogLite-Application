import FetchUrl from "./FetchUrl.js"

export default{
	template: `
		<div class = "px-4 mt-4">
			<h1>Login Page</h1>
			<br>
			<h1 class="text-center">Welcome to Simple Blog Lite</h1>
			<br><br>
			<h5 class = "text-xl-center"> Welcome to user interactive BlogLite</h5>
			<br>
			<br>
			<div class ="row g-3 fs-5">
				<div class="mb-3 .w-50 form-group">
					<label for="formGroupExampleInput" class="form-label">Email:</label>
					<input type="text" name="username" required class="form-control" id="formGroupExampleInput" v-model="formData.email"/>
				</div>
				<div class="mb-3 .w-50 form-group">
					<label for="exampleInputPassword1" class="form-label">Password:</label>
					<input type="password" name="password"  required class="form-control" id="exampleInputPassword1" v-model="formData.password" />
				</div>
				
				<div>
					<button @click="loginUser" class="btn btn-primary">Submit</button>
				</div>
			</div>
			
			<br><br>
			<p class = "fw-semibold fs-5">Don't have an account, <router-link :to="{ name: 'Signup'}">Signup</router-link></p>
		
		</div>
	`,
	
	data: function(){
		return{
			formData:{
				email: "",
				password: "",
			}
		}
	},
	
  methods: {
    loginUser: function() {
      FetchUrl('http://127.0.0.1:5000/login?include_auth_token', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.formData),
      })
	  .then((data) => {
		  console.log(data)
		  localStorage.setItem('auth-token',data.response.user.authentication_token)
		  this.$router.push({name: 'Dashboard'})
	  })
	  .catch((err) => alert(err))
    },
  },
}