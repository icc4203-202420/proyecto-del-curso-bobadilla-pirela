# app/controllers/api/v1/countries_controller.rb
class API::V1::CountriesController < ApplicationController
  def index
    countries = Country.all
    render json: countries
  end
end
