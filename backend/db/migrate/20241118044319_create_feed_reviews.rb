class CreateFeedReviews < ActiveRecord::Migration[6.0]
  def change
    create_table :feed_reviews do |t|
      t.decimal :rating, precision: 10, scale: 2
      t.string :text                               
      t.references :beer, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
