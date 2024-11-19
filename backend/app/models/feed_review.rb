class FeedReview < ApplicationRecord
    belongs_to :user
    belongs_to :bar
  
    # Validaciones
    validates :rating, presence: true
    validates :rating_global, presence: true
    validates :text, presence: true
    validates :beer_name, presence: true
    validates :bar_name, presence: true
    validates :country_name, presence: true
end
  