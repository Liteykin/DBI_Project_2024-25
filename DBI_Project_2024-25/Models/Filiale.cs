using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DBI_Project_2024_25.Models;

public class Filiale
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Adresse { get; set; } = default!;
    
    public ICollection<TierFiliale> TierFilialen = new List<TierFiliale>();

    public Filiale(int id, string name, string adresse)
    {
        Id = id;
        Name = name;
        Adresse = adresse;
    }
}