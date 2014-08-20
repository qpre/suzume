require 'rack/parser'
require "./app/app"
require './app/middlewares/backend'

use Suzume::Backend

use Rack::Parser, :content_types => {
  'application/json'  => Proc.new { |body| JSON.parse body }
}

run Server.new