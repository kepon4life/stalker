class UsersController < ApplicationController  
	before_filter :authenticate_user, :only => [:new, :index]

	def index
		@users = User.all
	end


	def new
		@titre = "New user"
		@user = User.new 
	end

	def create
		@user = User.new(params[:user])
		if @user.save
			redirect_to(:action => 'index')
		else
			flash[:notice] = "Form is invalid"
			flash[:color]= "invalid"
			render "new"
		end
	
	end

	
end