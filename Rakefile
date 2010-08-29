files = [ "intro", "pubsub", "routes", "modules", "outro" ]

task :default => :pineapple

task :pineapple do
	sh "mkdir -p dist"

	sh "cat " + files.map {|file| "src/" + file + ".js"}.join(" ") +
		" > dist/pineapple.js"
end
