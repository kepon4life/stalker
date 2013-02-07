require "base64"

class FrontendController < ApplicationController  
	before_filter :authenticate_user
	before_filter :is_frontend_user

	def index
		respond_to do |format|
			format.html
		end
	end

	def save
		if params[:imgColor]
			img = Base64.decode64(params[:imgColor].gsub("data:image/png;base64", ""));
			newImg = Time.now.to_i.to_s + DREAM_EXTENSION
			if file_put_contents("public" + PATH_TO_DREAMS_UNTREATED + newImg, img)
				render:json => {:imgUrl => newImg}
			else
				render:json => {:imgUrl => "PAS OK"}
			end
		else
			render:json => {:imgUrl => "PAS OK"}
		end
	end

	def file_put_contents( name, *contents )
		File.open( name, "a" ){ |file|
			contents.each{ |item|
				file << item
			}
		}
	end


	
end