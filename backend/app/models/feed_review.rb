class FeedReview < ApplicationRecord
    belongs_to :user
    belongs_to :bar, optional: true
end
  