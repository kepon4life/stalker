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
		if params[:metadatas] && params[:imgNormal]
			@dream = Dream.new(:metadatas => params[:metadatas])
			@dream.metadatas = params[:metadatas]
			imgNormal = Base64.decode64(params[:imgNormal].gsub("data:image/png;base64", ""));
			
			if @dream.save
				if file_put_contents("public" + PATH_TO_DREAMS + @dream.id.to_s + DREAM_EXTENSION, imgNormal)
					render :json => {:imgUrl => @dream.id.to_s + DREAM_EXTENSION}
				else
					render :json => {:imgUrl => "PAS OK"}
				end
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