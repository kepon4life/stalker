StalkerBackend::Application.routes.draw do

  match '/dreams/drestroy_all', :controller => 'dreams', :action => 'destroy_all'
  match '/dreams/populate', :controller => 'dreams', :action => 'populate_for_test'
  match '/dreams/tests', :controller => 'dreams', :action => 'dev_tests'

  match '/dreams/tag', :controller => 'dreams', :action => 'tag'
  match '/dreams/tagDream', :controller => 'dreams', :action => 'tagDream'

  match '/dreams/tagwithcat', :controller => 'dreams', :action => 'tagWithCat'
  match '/dreams/tagDreamwithcat', :controller => 'dreams', :action => 'tagDreamWithCat'

  match '/dreams/changestatus/:id/:valid/:secret_room', :controller => 'dreams', :action => 'changeStatus'

  match '/frontend/index', :controller =>"frontend", :action => "index"
  match '/frontend/save', :controller =>"frontend", :action => "save"
  match '/dream/:id', :controller =>"frontend", :action => "show_dream"

  match '/simple_slider', :controller =>"frontend", :action => "simple_slider"
  match '/web_slider', :controller =>"frontend", :action => "web_slider"
  match '/slider', :controller =>"frontend", :action => "slider"
  match '/draw', :controller => "frontend", :action => "draw"
  match '/drawtable', :controller => "frontend", :action => "drawtable"
  match '/drawsmartphone', :controller => "frontend", :action => "drawsmartphone"

  resources :categories, :users, :dreams, :events

  root :to => 'frontend#web_slider'

  match "pusher", :to => "pusher#test"
  match '/pusher/auth', :controller => 'pusher', :action => 'auth'

  match '/services/nbdreams', :controller => 'services', :action => 'get_number_of_dreams_to_treat'
  match '/services/dreamsevent', :controller => 'services', :action => 'get_dreams_for_event'
  match '/services/categories', :controller => 'services', :action => 'get_categories'
  match '/services/dreamssecretroom' , :controller => 'services', :action => 'get_dreams_for_secret_room'
  match '/services/dreamsvalidated', :controller => 'services', :action => 'get_dreams_validated'
  match '/services/dreamforsimpleslider' , :controller => 'services', :action => 'get_dream_for_simple_slider'

end
