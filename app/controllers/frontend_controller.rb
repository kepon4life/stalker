require "base64"
require "fileutils"

class FrontendController < ApplicationController  

	def slider
		respond_to do |format|
			format.html
		end
	end
	
	def draw
		respond_to do |format|
			format.html
		end
	end

	def drawsmartphone
		respond_to do |format|
			format.html
		end
	end

	def save
		if params[:imgColor] && params[:imgNormal]
			#imgColor = Base64.decode64(params[:imgColor].gsub("data:image/png;base64", ""));
			imgNormal = Base64.decode64(params[:imgNormal].gsub("data:image/png;base64", ""));
			FileUtils.rm Dir.glob("public" + PATH_TO_DREAMS_SENDED+"*")
			newImg = Time.now.to_i.to_s + DREAM_EXTENSION
			if file_put_contents("public" + PATH_TO_DREAMS_UNTREATED + newImg, imgNormal) && file_put_contents("public" + PATH_TO_DREAMS_SENDED + newImg, imgNormal)
				render :json => {:imgUrl => newImg}
			else
				render :json => {:imgUrl => "PAS OK"}
			end
		else
			render :json => {:imgUrl => "PAS OK"}
		end
	end

	def file_put_contents( name, *contents )
		File.open( name, "a:binary" ){ |file|
			contents.each{ |item|
				file << item
			}
		}
	end


	
end