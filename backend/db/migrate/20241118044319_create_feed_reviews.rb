class CreateFeedReviews < ActiveRecord::Migration[6.0]
  def change
    create_table :feed_reviews do |t|
      t.decimal :rating, precision: 10, scale: 2
      t.decimal :rating_global, precision: 10, scale: 2
      t.string :text                               
      t.string :beer_name, null: false
      t.string :bar_name, null: false
      t.string :country_name, null: false
      t.references :bar, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
