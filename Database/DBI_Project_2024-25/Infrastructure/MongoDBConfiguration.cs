using MongoDB.Driver;

namespace DBI_Project_2024_25.Infrastructure
{
    public class MongoDBConfiguration
    {
        public string ConnectionMode { get; set; } = "Local"; // "Local" or "Atlas"
        public string LocalConnectionString { get; set; } = "mongodb://localhost:27017";
        public string AtlasConnectionString { get; set; } = 
            "mongodb+srv://liteykinmark:lWKP596b8ynKh58@cluster0.mongodb.net/dbi_project_2024-25?retryWrites=true&w=majority";
    }

    public interface IMongoDBService
    {
        IMongoDatabase GetDatabase();
        void SwitchConnectionMode(string mode);
        string GetCurrentConnectionMode();
    }

    public class MongoDBService : IMongoDBService
    {
        private readonly MongoDBConfiguration _config;
        private IMongoClient _client;
        private readonly string _databaseName = "dbi_project_2024-25";

        public MongoDBService(MongoDBConfiguration config)
        {
            _config = config;
            InitializeClient();
        }

        private void InitializeClient()
        {
            var connectionString = _config.ConnectionMode == "Atlas" 
                ? _config.AtlasConnectionString 
                : _config.LocalConnectionString;
                
            _client = new MongoClient(connectionString);
        }

        public IMongoDatabase GetDatabase()
        {
            return _client.GetDatabase(_databaseName);
        }

        public void SwitchConnectionMode(string mode)
        {
            if (mode != "Local" && mode != "Atlas")
                throw new ArgumentException("Mode must be either 'Local' or 'Atlas'");

            if (_config.ConnectionMode != mode)
            {
                _config.ConnectionMode = mode;
                InitializeClient();
            }
        }

        public string GetCurrentConnectionMode()
        {
            return _config.ConnectionMode;
        }
    }
}