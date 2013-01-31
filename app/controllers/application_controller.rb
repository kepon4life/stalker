class ApplicationController < ActionController::Base
  protect_from_forgery
	
	def is_admin_user
		user = @current_user
		if(user.group.id != 1)
			flash[:error] = "You have not permissions to access this funcion"
			redirect_to("/401.html")
			return false
		else
			return true
		end
	end

	def is_frontend_user
		user = @current_user
		if(user.group.id != 2 && user.group.id != 1)
			flash[:error] = "You have not permissions to access this funcion"
			redirect_to("/401.html")
			return false
		else
			return true
		end
	end

	def is_service_user
		user = @current_user
		if(user.group.id != 3 && user.group.id != 1)
			flash[:error] = "You have not permissions to access this funcion"
			redirect_to("/401.html")
			return false
		else
			return true
		end
	end

	protected 
		def authenticate_user
			unless session[:user_id]
				redirect_to(:controller => 'sessions', :action => 'login')
				return false
			else
				# set current user object to @current_user object variable
				@current_user = User.find session[:user_id] 
				return true
			end
		end
		
		def save_login_state
			if session[:user_id]
				redirect_to(:controller => 'sessions', :action => 'home')
				return false
			else
		return true
		end

		
	end


end
