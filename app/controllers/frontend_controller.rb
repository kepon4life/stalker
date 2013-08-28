require "base64"
require "fileutils"
require 'mini_magick'
require 'pusher'

Pusher.app_id = PUSHER_API_APP_ID
Pusher.key = PUSHER_API_KEY
Pusher.secret = PUSHER_API_SECRET

class FrontendController < ApplicationController

	def slider
		respond_to do |format|
			format.html
		end
	end


	def simple_slider
		respond_to do |format|
			format.html
		end
	end

	def web_slider
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
  		I18n.locale = request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
  		case I18n.locale
	  		when :en
	  			@msg_intro = "Draw your wish."
	  			@msg_end   = "Thanks for your participation,<br />find it <a href=\"#\">here</a>."
	  		else
	  			@msg_intro = "Dessinez votre reve."
	  			@msg_end   = "Merci de votre participation,<br />retrouvez-la <a href=\"#\">ici</a>."
  		end

		respond_to do |format|
			format.html
		end
	end

	def show_dream

		@dream = Dream.find(params[:id])
		puts params[:token]
		if(!@dream.is_valid && params[:token] != @dream.token)
			@dream = nil
		end

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
					image = MiniMagick::Image.read(imgNormal)
					image.resize "256x160"
					image.write  "public" + PATH_TO_DREAMS_THUMBNAILS + @dream.id.to_s + DREAM_EXTENSION
					Pusher[PUSHER_CHANEL_DREAM_CREATED].trigger(PUSHER_EVENT_DREAM_CREATED, {:imgUrl => @dream.id.to_s + DREAM_EXTENSION})
					render :json => {:imgUrl => @dream.id.to_s + DREAM_EXTENSION, :token => @dream.token, :dream_id => @dream.id.to_s}
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