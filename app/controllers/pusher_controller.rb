# http://rubygems.org/gems/pusher
require 'pusher'

Pusher.app_id = PUSHER_API_APP_ID
Pusher.key = PUSHER_API_KEY
Pusher.secret = PUSHER_API_SECRET

class PusherController < ApplicationController
  protect_from_forgery :except => :auth # stop rails CSRF protection for this action


  def test
    Pusher[PUSHER_CHANEL].trigger(PUSHER_EVENT, {:imgUrl => "test" + DREAM_EXTENSION})
    render :text => "test pusher"
  end

  def auth
      response = Pusher[params[:channel_name]].authenticate(params[:socket_id])
      render :json => response
  end

  


end