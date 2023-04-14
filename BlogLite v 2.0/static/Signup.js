import FetchUrl from "./FetchUrl2.js"

export default{
	template: `
		<div id="app" class = "px-4 mt-4">
			<h1>Sign Up Page</h1>
			<br>
			<br>
			<div class ="row g-3 fs-5">
				<div class="mb-3 .w-50 form-group">
					<label for="formGroupExampleInput" class="form-label">Full Name:</label>
					<input type="text" name="full_name" class="form-control" id="formGroupExampleInput" v-model="formData.full_name" required />
				</div>
				<div class="mb-3">
					<label for="exampleInputEmail1" class="form-label">Email address:</label>
					<input type="email" name = "email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" v-model="formData.email" required  />
					<div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
				</div>
				<div class="mb-3 .w-50 form-group">
					<label for="formGroupExampleInput" class="form-label">Username:</label>
					<input type="text" name="username" class="form-control" id="formGroupExampleusername" v-model="formData.username" required />
				</div>
				<div class="mb-3 .w-50 form-group">
					<label for="inputPassword5" class="form-label">Password</label>
					<input type="password" name = "password" id="inputPassword5" class="form-control" aria-describedby="passwordHelpBlock" v-model="formData.Password" required />
					<div id="passwordHelpBlock" class="form-text">
					  Your password must be 5-20 characters long and must not contain spaces.
					</div>
				</div>
				<div class="col-4 form-group">
					<label for="exampleFormControlInput1" class="form-label">Date of Birth</label>
					<input type="date" id="birthday" name="deadline" class="form-control text-center" v-model="formData.dob" required>
					<div id="birthdayHelpBlock" class="form-text">
						 dob should be on or before today's date.
					</div>
				</div>
				
				<div>
					<button @click="registerUser" class="btn btn-primary">Submit</button>
				</div>
				<div class="text-danger">
				  <p v-if="errors.length > 0">
					<b class="card-title">Please correct the following error(s):</b>
					<ul>
					  <li v-for="error in errors">{{ error }}</li>
					</ul>
				  </p>
				</div>
			</div>
			
			<br>
			<p class = "fw-semibold">Already have an account, <router-link :to="{ name: 'Signin'}">Login</router-link></p>
		
		</div>
	`,
	
	data: function(){
		return{	
			formData:{
				full_name: null,
				email: null,
				username: null,
				Password: null,
				dob: null,
			},
			errors: [],
		}
	},
	
  methods: {
    registerUser: function() {
		  FetchUrl('http://127.0.0.1:5000/api/user', {
			method: 'post',
			headers: {
			  'Content-Type': 'application/json',
			},
			body: JSON.stringify(this.formData),
		  })
		  .then((data) => {
			  console.log(data)
			  if(data.errors){
				  this.errors = data.errors
			  } else {
				  this.$router.push({name: 'Signin'})
			  }
		  })
		  .catch((err) => {
			  this.errors = err.message.split(",")
			  console.log(typeof err.message)
		  })
    },
  },
}