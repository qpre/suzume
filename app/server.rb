require 'sinatra/base'
require 'sinatra/json'
require 'sinatra/cross_origin'
require 'sinatra/activerecord'

require_relative './routes/chatty'

class API < Sinatra::Base
  # ActiveRecord
  register Sinatra::ActiveRecordExtension
  
  # CORS
  register Sinatra::CrossOrigin
  enable :cross_origin
  
  # MiddleWare
  use Rack::Session::Cookie,
    :expire_after => 2592000,
    :old_secret => 'also_change_me'

  enable :sessions
  
  # API Extensions
  #register Sinatra::API::ProvidersAuth
  #register Sinatra::API::SessionAuth
  
  # Exposing Models
  register Sinatra::API::Routes::Chatty
  
  # Helpers
  helpers Sinatra::JSON
  
  configure do
    # threaded - False: Will take requests on the reactor thread
    #            True:  Will queue request for background thread
    set :threaded, false
    
    # CrossOrigin config
    set :allow_origin, :any
    set :allow_methods, [:get, :post]
    set :allow_credentials, true
  end
end
